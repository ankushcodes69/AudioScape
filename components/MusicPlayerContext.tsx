import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { Audio } from "expo-av";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import innertube from "@/components/yt";

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<SearchResult | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Error configuring audio mode:", error);
      }
    };

    configureAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playAudio = async (song: SearchResult) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setIsLoading(true);
      setCurrentSong(song);

      const yt = await innertube;
      const info = await yt.music.getInfo(song.id);
      const format = info.chooseFormat({ type: "audio", quality: "best" });
      const streamUrl = `${format?.decipher(yt.session.player)}`;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else if (currentSong) {
      await playAudio(currentSong);
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
      {currentSong && (
        <CurrentSongBar
          song={currentSong}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
        />
      )}
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#222",
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
