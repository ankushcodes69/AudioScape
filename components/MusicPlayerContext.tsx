import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import innertube from "@/youtube";
import TrackPlayer, { State, Track } from "react-native-track-player";
import { Helpers } from "youtubei.js";
import { Alert } from "react-native";

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
): Promise<Track | null> {
  try {
    const yt = await innertube;
    const info = await yt.getBasicInfo(inid);

    // Check if the video is available
    if (info.playability_status?.status !== "OK") {
      console.log(
        `[MusicPlayer] Video ${inid} is not available: ${info.playability_status?.reason}`
      );
      return null;
    }

    const format = info.chooseFormat({ type: "audio", quality: "best" });
    if (!format) {
      console.log(`[MusicPlayer] No suitable audio format found for ${inid}`);
      return null;
    }

    const streamUrl = `${format.decipher(yt.session.player)}`;
    const item = info.basic_info;

    const res = {
      id: inid,
      url: streamUrl,
      title: title || item.title || "Unknown title",
      artist:
        author || item.author?.replace(" - Topic", "") || "Unknown artist",
      artwork:
        item.thumbnail && item.thumbnail[0]
          ? item.thumbnail[0].url
          : "https://placehold.co/50",
    };
    return res;
  } catch (error) {
    console.log(
      `[MusicPlayer] Error getting info for ${inid}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return null;
  }
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
        const upNextResponse = await yt.music.getUpNext(songId);
        const upNext = upNextResponse?.contents;

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
              try {
                const id = item.video_id;
                const info = await getInfo(id);

                if (info) {
                  log(`Adding to queue: ${info.title}`);
                  await TrackPlayer.add(info);
                } else {
                  log(`Skipping unavailable song with ID: ${id}`);
                }
              } catch (error) {
                // If error occurs with one song, log it and continue with next
                log(
                  `Error with song ${item.video_id}, skipping: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`
                );
              }
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

      const info = await getInfo(song.id);
      if (!info) {
        Alert.alert(
          "Playback Error",
          `The selected song "${song.title}" is unavailable. It may have been removed or restricted.`
        );
        setIsLoading(false);
        return;
      }

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
      Alert.alert(
        "Playback Error",
        `Failed to play "${song.title}". Please try again later.`
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

            try {
              const item = songs[i];
              const id = item.id;
              const info = await getInfo(id);

              if (info) {
                log(`Adding to queue: ${info.title}`);
                await TrackPlayer.add(info);
              } else {
                log(`Skipping unavailable playlist song: ${item.title}`);
              }
            } catch (error) {
              // If error occurs with one song, log it and continue with next
              log(
                `Error with playlist song ${songs[i].title}, skipping: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
            }

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

      if (!songs.length) {
        Alert.alert("Playback Error", "The playlist appears to be empty.");
        setIsLoading(false);
        return;
      }

      await resetPlayerState();

      const info = await getInfo(songs[0].id);
      if (!info) {
        // First song unavailable, try the next one if available
        log(`First song in playlist unavailable, looking for alternatives`);

        let foundValidTrack = false;
        for (let i = 1; i < songs.length; i++) {
          const nextInfo = await getInfo(songs[i].id);
          if (nextInfo) {
            log(`Found alternative starting track: ${nextInfo.title}`);
            await TrackPlayer.add(nextInfo);
            await TrackPlayer.play();
            setIsPlaying(true);
            currentSongIdRef.current = songs[i].id;
            foundValidTrack = true;

            // Start adding from the track after this one
            const remainingSongs = [
              ...songs.slice(0, i),
              ...songs.slice(i + 1),
            ];
            addPlaylistSongs(remainingSongs);
            break;
          }
        }

        if (!foundValidTrack) {
          Alert.alert(
            "Playback Error",
            "None of the songs in this playlist are currently available."
          );
          setIsLoading(false);
          return;
        }
      } else {
        await TrackPlayer.add(info);
        await TrackPlayer.play();
        setIsPlaying(true);
        currentSongIdRef.current = songs[0].id;
        addPlaylistSongs(songs);
      }
    } catch (error) {
      log(
        `Error in playPlaylist: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      Alert.alert(
        "Playback Error",
        "Failed to play the playlist. Please try again later."
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
      Alert.alert(
        "Playback Error",
        "Failed to toggle playback state. Please try again."
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
