import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Alert,
  SafeAreaView,
  Keyboard,
  TextInput,
  Text,
  View,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import innertube from "@/youtube";
import { Colors } from "@/constants/Colors";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface SearchSuggestions {
  text: string;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<
    SearchSuggestions[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { playAudio } = useMusicPlayer();
  const searchBarRef = useRef<TextInput>(null);

  const handleSearch = async (query: string) => {
    if (!query) return;

    Keyboard.dismiss();

    setIsSearching(false);
    setIsLoading(true);
    try {
      const yt = await innertube;
      const searchResults = await yt.music.search(query, {
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
                  : "https://placehold.co/50",
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

  const handleSearchSuggestions = async () => {
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const yt = await innertube;
      const searchSuggestions = await yt.music.getSearchSuggestions(
        searchQuery
      );

      if (
        searchSuggestions &&
        Array.isArray(searchSuggestions) &&
        searchSuggestions.length > 0 &&
        searchSuggestions[0].contents
      ) {
        const formattedResults: SearchSuggestions[] =
          searchSuggestions[0].contents
            .filter(
              (item: any) => item && item.suggestion && item.suggestion.text
            )
            .map((item: any) => ({
              text: item.suggestion.text,
            }));

        setSearchSuggestions(formattedResults);
      } else {
        setSearchSuggestions([]);
        Alert.alert("No results", "No songs found for your search query.");
      }
    } catch (error) {
      console.error("Error searching:", error);
      Alert.alert(
        "Error",
        "An error occurred while searching. Please try again."
      );
    }
  };

  useEffect(() => {
    async function fetchResults() {
      await handleSearchSuggestions();
    }

    fetchResults();
  }, [searchQuery]);

  const handleSongSelect = (song: SearchResult) => {
    playAudio(song);
  };

  const handleSearchSuggestionsSelect = async (
    suggestion: SearchSuggestions
  ) => {
    Keyboard.dismiss();
    await setSearchQuery(suggestion.text);
    await handleSearch(suggestion.text);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={() => handleSongSelect(item)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.resultThumbnail} />
      <View style={styles.resultText}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultArtist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchSuggestions = ({ item }: { item: SearchSuggestions }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={() => handleSearchSuggestionsSelect(item)}
    >
      <EvilIcons
        name="search"
        size={30}
        color={Colors.text}
        style={{ marginRight: 10, marginLeft: 10, marginTop: -3 }}
      />
      <Text style={styles.resultTitle}>{item.text}</Text>
    </TouchableOpacity>
  );

  useFocusEffect(
    React.useCallback(() => {
      if (searchBarRef.current) {
        searchBarRef.current.focus();
      }
    }, [])
  );

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
      <Searchbar
        placeholder="Search for a song"
        value={searchQuery}
        onChangeText={setSearchQuery}
        mode={"bar"}
        autoFocus
        icon={{ source: "arrow-left", direction: "auto" }}
        iconColor="white"
        onIconPress={() => {
          Keyboard.dismiss();
          router.back();
        }}
        onClearIconPress={() => {
          Keyboard.dismiss();
        }}
        onSubmitEditing={() => handleSearch(searchQuery)}
        style={styles.searchbar}
        inputStyle={{ color: "white" }}
        placeholderTextColor="#999"
        theme={{
          colors: {
            primary: "white",
          },
        }}
        ref={searchBarRef}
      />

      {isSearching ? (
        <FlatList
          data={searchSuggestions}
          renderItem={renderSearchSuggestions}
          keyExtractor={(item) => item.text}
          style={styles.searchResults}
          contentContainerStyle={{ paddingBottom: 90 }}
          keyboardShouldPersistTaps="handled"
        />
      ) : isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.searchResults}
          contentContainerStyle={{ paddingBottom: 90 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  searchbar: {
    width: "95%",
    backgroundColor: "#101010",
  },
  searchResults: {
    width: "100%",
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
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
    color: Colors.text,
    fontSize: 16,
  },
  resultArtist: {
    color: "#999",
    fontSize: 14,
  },
});
