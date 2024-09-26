import React, { createContext, useState, useContext, ReactNode } from "react";
import innertube from "@/components/yt";
import TrackPlayer, { State } from "react-native-track-player";

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
      const info = await yt.music.getInfo(song.id);
      const format = info.chooseFormat({ type: "audio", quality: "best" });
      const streamUrl = `${format?.decipher(yt.session.player)}`;
      const item = info.basic_info;

      const currentTrackIndex = (await TrackPlayer.getActiveTrackIndex()) || -1;

      await TrackPlayer.add(
        {
          id: song.id,
          url: streamUrl,
          title: info.basic_info.title,
          artist: info.basic_info.author,
          artwork:
            item.thumbnail && item.thumbnail[0]
              ? item.thumbnail[0].url
              : "https://via.placeholder.com/50",
        },
        currentTrackIndex + 1
      );

      await TrackPlayer.skipToNext();

      await TrackPlayer.play();

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
