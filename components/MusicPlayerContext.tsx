import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
} from "react";
import innertube from "@/components/yt";
import TrackPlayer, { State, Track } from "react-native-track-player";
import { Helpers } from "youtubei.js";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface MusicPlayerContextType {
  isPlaying: boolean;
  isLoading: boolean;
  playAudio: (song: SearchResult) => Promise<void>;
  togglePlayPause: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

const isValidUpNextItem = (
  item: Helpers.YTNode
): item is Helpers.YTNode & { video_id: string } => {
  return "video_id" in item && typeof item.video_id === "string";
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return context;
};

interface MusicPlayerProviderProps {
  children: ReactNode;
}

async function getInfo(inid: string): Promise<Track> {
  const yt = await innertube;
  const info = await yt.music.getInfo(inid);
  const format = info.chooseFormat({ type: "audio", quality: "best" });
  const streamUrl = `${format?.decipher(yt.session.player)}`;
  const item = info.basic_info;

  const res = {
    id: inid,
    url: streamUrl,
    title: info.basic_info.title,
    artist: info.basic_info.author,
    artwork:
      item.thumbnail && item.thumbnail[0]
        ? item.thumbnail[0].url
        : "https://via.placeholder.com/50",
  };
  return res;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({
  children,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isAddingToQueueRef = useRef<boolean>(false);

  const playAudio = async (song: SearchResult) => {
    try {
      setIsLoading(true);

      // Stop any ongoing queue additions
      if (isAddingToQueueRef.current) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        isAddingToQueueRef.current = false;
      }

      // Create a new AbortController for this playback
      abortControllerRef.current = new AbortController();

      const yt = await innertube;

      // Reset the player and add the new song
      await TrackPlayer.reset();
      await TrackPlayer.add(await getInfo(song.id));
      await TrackPlayer.play();

      setIsPlaying(true);

      // Start adding up-next songs
      isAddingToQueueRef.current = true;
      const upNext = (await yt.music.getUpNext(song.id)).contents;

      if (upNext && Array.isArray(upNext) && upNext.length > 0) {
        for (let i = 1; i < upNext.length; i++) {
          // Check if we should stop adding to the queue
          if (
            !isAddingToQueueRef.current ||
            abortControllerRef.current.signal.aborted
          ) {
            console.log("Up-next addition stopped");
            break;
          }

          const item = upNext[i];
          if (isValidUpNextItem(item)) {
            const id = item.video_id;
            const info = await getInfo(id);
            console.log(`Adding to queue: ${info.title}`);
            await TrackPlayer.add(info);
          }
        }
      }

      isAddingToQueueRef.current = false;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Playback aborted");
        } else {
          console.error("Error in playAudio:", error.message);
        }
      } else {
        console.error("An unknown error occurred in playAudio");
      }
    } finally {
      setIsLoading(false);
      isAddingToQueueRef.current = false;
    }
  };

  const togglePlayPause = async () => {
    const currentState = (await TrackPlayer.getPlaybackState()).state;

    if (currentState === State.Playing) {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } else {
      await TrackPlayer.play();
      setIsPlaying(true);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        isPlaying,
        isLoading,
        playAudio,
        togglePlayPause,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};
