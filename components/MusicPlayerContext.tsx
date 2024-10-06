import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useCallback,
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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  const currentSongIdRef = useRef<string | null>(null);

  const log = useCallback((message: string) => {
    console.log(`[MusicPlayer] ${message}`);
  }, []);

  const resetPlayerState = useCallback(async () => {
    log("Resetting player state");
    if (isAddingToQueueRef.current) {
      log("Stopping ongoing queue additions");
      isAddingToQueueRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    // Wait for any ongoing operations to complete
    await delay(200);
    await TrackPlayer.reset();
    currentSongIdRef.current = null;
  }, [log]);

  const addUpNextSongs = useCallback(
    async (songId: string) => {
      log(`Starting to add up-next songs for ${songId}`);
      isAddingToQueueRef.current = true;
      abortControllerRef.current = new AbortController();

      try {
        const yt = await innertube;
        const upNext = (await yt.music.getUpNext(songId)).contents;

        if (upNext && Array.isArray(upNext) && upNext.length > 0) {
          for (let i = 1; i < upNext.length; i++) {
            if (
              !isAddingToQueueRef.current ||
              abortControllerRef.current.signal.aborted
            ) {
              log("Up-next addition stopped");
              break;
            }

            const item = upNext[i];
            if (isValidUpNextItem(item)) {
              const id = item.video_id;
              const info = await getInfo(id);
              log(`Adding to queue: ${info.title}`);
              await TrackPlayer.add(info);
            }

            // Add a small delay between each addition to allow for interruption
            await delay(100);
          }
        }
      } catch (error) {
        log(
          `Error adding up-next songs: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        isAddingToQueueRef.current = false;
        log("Finished adding up-next songs");
      }
    },
    [log]
  );

  const playAudio = async (song: SearchResult) => {
    try {
      log(`Starting playback for song: ${song.title}`);
      setIsLoading(true);

      await resetPlayerState();

      const info = await getInfo(song.id);
      await TrackPlayer.add(info);
      await TrackPlayer.play();

      setIsPlaying(true);
      currentSongIdRef.current = song.id;

      // Start adding up-next songs after a short delay
      setTimeout(() => addUpNextSongs(song.id), 1000);
    } catch (error) {
      log(
        `Error in playAudio: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    try {
      const currentState = (await TrackPlayer.getPlaybackState()).state;

      if (currentState === State.Playing) {
        await TrackPlayer.pause();
        setIsPlaying(false);
        log("Playback paused");
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
        log("Playback resumed");
      }
    } catch (error) {
      log(
        `Error in togglePlayPause: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
