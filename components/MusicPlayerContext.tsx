import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import innertube from "@/youtube";
//import { getBasicInfo } from "@/youtubeUtils/main";
import TrackPlayer, { State, Track } from "react-native-track-player";
import { Helpers } from "youtubei.js";

interface SongItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface MusicPlayerContextType {
  isPlaying: boolean;
  isLoading: boolean;
  playAudio: (song: SongItem) => Promise<void>;
  playPlaylist: (songs: SongItem[]) => Promise<void>;
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

async function getInfo(
  inid: string,
  title?: string,
  author?: string
): Promise<Track> {
  const yt = await innertube;
  const info = await yt.getBasicInfo(inid);
  //console.log(info.playability_status);
  const format = info.chooseFormat({ type: "audio", quality: "best" });
  const streamUrl = `${format?.decipher(yt.session.player)}`;
  //console.log(streamUrl);
  const item = info.basic_info;

  const res = {
    id: inid,
    url: streamUrl,
    title: title || item.title || "Unknown title",
    artist: author || item.author?.replace(" - Topic", "") || "Unknown artist",
    artwork:
      item.thumbnail && item.thumbnail[0]
        ? item.thumbnail[0].url
        : "https://placehold.co/50",
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
              const info = await getInfo(
                id
                //`${String(item.title)}`,
                //item.author
              );
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

  const playAudio = async (song: SongItem) => {
    try {
      log(`Starting playback for song: ${song.title}`);
      setIsLoading(true);

      await resetPlayerState();

      const info = await getInfo(song.id); //song.title, song.artist);
      await TrackPlayer.add(info);
      await TrackPlayer.play();

      setIsPlaying(true);
      currentSongIdRef.current = song.id;

      addUpNextSongs(song.id);
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

  const addPlaylistSongs = useCallback(
    async (songs: SongItem[]) => {
      log(`Starting to add songs from playlist`);
      isAddingToQueueRef.current = true;
      abortControllerRef.current = new AbortController();

      try {
        if (Array.isArray(songs) && songs.length > 1) {
          for (let i = 1; i < songs.length; i++) {
            if (
              !isAddingToQueueRef.current ||
              abortControllerRef.current.signal.aborted
            ) {
              log("Playlist song addition stopped");
              break;
            }

            const item = songs[i];
            const id = item.id;
            const info = await getInfo(
              id
              //`${String(item.title)}`,
              //item.author
            );
            log(`Adding to queue: ${info.title}`);
            await TrackPlayer.add(info);

            // Add a small delay between each addition to allow for interruption
            await delay(100);
          }
        }
      } catch (error) {
        log(
          `Error adding playlist songs: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        isAddingToQueueRef.current = false;
        log("Finished adding playlist songs");
      }
    },
    [log]
  );

  const playPlaylist = async (songs: SongItem[]) => {
    try {
      log(`Starting playback for playlist`);
      setIsLoading(true);

      await resetPlayerState();

      const info = await getInfo(songs[0].id); //songs[0].title, songs[0].artist);
      await TrackPlayer.add(info);
      await TrackPlayer.play();

      setIsPlaying(true);
      currentSongIdRef.current = songs[0].id;

      addPlaylistSongs(songs);
    } catch (error) {
      log(
        `Error in playPlaylist: ${
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
        playPlaylist,
        togglePlayPause,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};
