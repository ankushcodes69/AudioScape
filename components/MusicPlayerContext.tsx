import React, { createContext, useState, useContext, ReactNode } from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
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

      await TrackPlayer.add({
        id: song.id,
        url: streamUrl,
        title: info.basic_info.title,
        artwork:
          item.thumbnail && item.thumbnail[0]
            ? item.thumbnail[0].url
            : "https://via.placeholder.com/50",
      });

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

const CurrentSongBar: React.FC<{
  song: SearchResult;
  isPlaying: boolean;
  onPlayPause: () => void;
}> = ({ song, isPlaying, onPlayPause }) => {
  return (
    <ThemedView style={styles.currentSong}>
      <Image source={{ uri: song.thumbnail }} style={styles.currentThumbnail} />
      <ThemedView style={styles.currentSongInfo}>
        <ThemedText style={styles.currentTitle}>{song.title}</ThemedText>
        <ThemedText style={styles.currentArtist}>{song.artist}</ThemedText>
      </ThemedView>
      <TouchableOpacity style={styles.playPauseButton} onPress={onPlayPause}>
        <ThemedText style={styles.buttonText}>
          {isPlaying ? "Pause" : "Play"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  currentSong: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    bottom: 0,
    left: 0,
    right: 0,
  },
  currentThumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  currentSongInfo: {
    flex: 1,
  },
  currentTitle: {
    color: "white",
    fontSize: 16,
  },
  currentArtist: {
    color: "#999",
    fontSize: 14,
  },
  playPauseButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
