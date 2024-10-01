import React, { createContext, useState, useContext, ReactNode } from "react";
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
  currentSong: SearchResult | null;
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
  const [currentSong, setCurrentSong] = useState<SearchResult | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const playAudio = async (song: SearchResult) => {
    try {
      setIsLoading(true);
      setCurrentSong(song);

      const yt = await innertube;

      await TrackPlayer.reset();

      await TrackPlayer.add(await getInfo(song.id));

      await TrackPlayer.play();

      const upNext = (await yt.music.getUpNext(song.id)).contents;

      if (upNext && Array.isArray(upNext) && upNext.length > 0) {
        for (let i = 1; i < upNext.length; i++) {
          const item = upNext[i];
          if (isValidUpNextItem(item)) {
            const id = item.video_id;
            const info = await getInfo(id);
            console.log(info.title);
            await TrackPlayer.add(info);
          }
        }
      }

      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
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
        currentSong,
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
