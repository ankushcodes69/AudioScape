import React, { useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { useMusicPlayer } from "../../components/MusicPlayerContext";
import innertube from "../../components/yt";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { playAudio } = useMusicPlayer();

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
    playAudio(song);
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
});
