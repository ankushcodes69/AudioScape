import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import innertube from "@/components/yt";

type SoundType = Audio.Sound | null;

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string>("");
  const [sound, setSound] = useState<SoundType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<SearchResult | null>(null);

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

  const handleSearch = async () => {
    if (!searchQuery) return;

    setIsLoading(true);
    try {
      const yt = await innertube;
      const searchResults = await yt.music.search(searchQuery, {
        type: "song",
      });

      if (
        searchResults &&
        searchResults.contents &&
        Array.isArray(searchResults.contents) &&
        searchResults.contents.length > 0 &&
        searchResults.contents[0].contents
      ) {
        const formattedResults: SearchResult[] =
          searchResults.contents[0].contents
            .filter((item: any) => item && item.id && item.title)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              artist:
                item.artists && item.artists[0]
                  ? item.artists[0].name
                  : "Unknown Artist",
              thumbnail:
                item.thumbnail &&
                item.thumbnail.contents &&
                item.thumbnail.contents[0]
                  ? item.thumbnail.contents[0].url
                  : "https://via.placeholder.com/50",
            }));

        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
        Alert.alert("No results", "No songs found for your search query.");
      }
    } catch (error) {
      console.error("Error searching:", error);
      Alert.alert(
        "Error",
        "An error occurred while searching. Please try again."
      );
    }
    setIsLoading(false);
  };

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

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={() => handleSongSelect(item)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.resultThumbnail} />
      <ThemedView style={styles.resultText}>
        <ThemedText style={styles.resultTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.resultArtist}>{item.artist}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>YouTube Music Player</ThemedText>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setSearchQuery}
          value={searchQuery}
          placeholder="Search for a song"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <ThemedText style={styles.buttonText}>Search</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      {isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.searchResults}
        />
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
    padding: 20,
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