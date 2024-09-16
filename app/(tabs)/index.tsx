import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { HomeFeed } from "@/components/HomeFeed";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Audio } from "expo-av";
import innertube from "@/components/yt";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface HomeFeed {
  sections?: (MusicCarouselShelf | MusicTasteBuilderShelf)[];
}

interface MusicCarouselShelf {
  contents?: any[];
}

interface MusicTasteBuilderShelf {
}

function isMusicCarouselShelf(
  section: MusicCarouselShelf | MusicTasteBuilderShelf
): section is MusicCarouselShelf {
  return "contents" in section;
}

type SoundType = Audio.Sound | null;

export default function HomeScreen() {
  const [homeFeedResults, setHomeFeedResults] = useState<SearchResult[]>([]);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>("");
  const [sound, setSound] = useState<SoundType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<SearchResult | null>(null);

  useEffect(() => {
    const getHomeFeed = async () => {
      setIsLoading(true);
      try {
        const yt = await innertube;
        const homeFeed: HomeFeed = await yt.music.getHomeFeed();

        if (homeFeed?.sections && homeFeed.sections.length > 0) {
          const firstSection = homeFeed.sections[0];

          if (
            isMusicCarouselShelf(firstSection) &&
            Array.isArray(firstSection.contents)
          ) {
            const formattedResults: SearchResult[] = firstSection.contents
              .filter((item: any) => item?.id && item?.title)
              .map((item: any) => ({
                id: item.id,
                title: item.title,
                artist: item.artists?.[0]?.name ?? "Unknown Artist",
                thumbnail:
                  item.thumbnail?.contents?.[0]?.url ??
                  "https://via.placeholder.com/50",
              }));
              setHomeFeedResults(formattedResults);
          } else {
            setHomeFeedResults([]);
            Alert.alert("No results", "No songs found in the home feed.");
          }
        } else {
          setHomeFeedResults([]);
          Alert.alert("No results", "Unable to fetch home feed.");
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "An error occurred while fetching the home feed. Please try again."
        );
      }
      setIsLoading(false);
    };

    getHomeFeed();

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

  const handleSongSelect = (song: SearchResult) => {
    setYoutubeVideoId(song.id);
    setCurrentSong(song);
    playAudio();
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
    } else if (youtubeVideoId) {
      await playAudio();
    }
  };

  const playAudio = async () => {
    if (!youtubeVideoId) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setIsLoading(true);

      const yt = await innertube;
      const info = await yt.music.getInfo(youtubeVideoId);
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

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <HomeFeed results={homeFeedResults} onItemClick={handleSongSelect} />
      )}
      {currentSong && (
        <ThemedView style={styles.currentSong}>
          <Image
            source={{ uri: currentSong.thumbnail }}
            style={styles.currentThumbnail}
          />
          <ThemedView style={styles.currentSongInfo}>
            <ThemedText style={styles.currentTitle}>
              {currentSong.title}
            </ThemedText>
            <ThemedText style={styles.currentArtist}>
              {currentSong.artist}
            </ThemedText>
          </ThemedView>
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={togglePlayPause}
          >
            <ThemedText style={styles.buttonText}>
              {isPlaying ? "Pause" : "Play"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    margin: 20,
  },
  searchContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#444",
    borderWidth: 1,
    paddingHorizontal: 10,
    color: "white",
    backgroundColor: "#333",
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  searchResults: {
    width: "100%",
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  resultThumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    color: "white",
    fontSize: 16,
  },
  resultArtist: {
    color: "#999",
    fontSize: 14,
  },
  currentSong: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    position: "absolute",
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
});
