import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  SafeAreaView,
  Keyboard,
  TextInput,
  Text,
  View,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { Searchbar } from "react-native-paper";
import LoaderKit from "react-native-loader-kit";
import { useActiveTrack } from "react-native-track-player";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { FullScreenGradientBackground } from "@/components/GradientBackground";
import { EvilIcons, Entypo } from "@expo/vector-icons";
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

const gradientIndex = Math.floor(Math.random() * (19 + 1));

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<
    SearchSuggestions[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const activeTrack = useActiveTrack();
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

  const handleSearchSuggestions = useCallback(async () => {
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
  }, [searchQuery]);

  useEffect(() => {
    async function fetchResults() {
      await handleSearchSuggestions();
    }

    fetchResults();
  }, [handleSearchSuggestions]);

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
    <View key={item.id} style={styles.searchResult}>
      <TouchableOpacity
        style={styles.searchResultTouchableArea}
        onPress={() => handleSongSelect(item)}
      >
        <FastImage
          source={{ uri: item.thumbnail }}
          style={styles.resultThumbnail}
        />
        {activeTrack?.id === item.id && (
          <LoaderKit
            style={styles.trackPlayingIconIndicator}
            name="LineScalePulseOutRapid"
            color="white"
          />
        )}
        <View style={styles.resultText}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.resultArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          // Convert the song object to a JSON string
          const songData = JSON.stringify({
            id: item.id,
            title: item.title,
            artist: item.artist,
            thumbnail: item.thumbnail,
          });

          router.push({
            pathname: "/(modals)/menu",
            params: { songData: songData, type: "song" },
          });
        }}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Entypo name="dots-three-vertical" size={15} color="white" />
      </TouchableOpacity>
    </View>
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
    <FullScreenGradientBackground index={gradientIndex}>
      <SafeAreaView style={[styles.container, { paddingTop: top }]}>
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
          <View style={{ flex: 1, justifyContent: "center" }}>
            <LoaderKit
              style={{ width: 50, height: 50, alignSelf: "center" }}
              name="BallSpinFadeLoader"
              color="white"
            />
          </View>
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
    </FullScreenGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
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
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 30,
  },
  searchResultTouchableArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultThumbnail: {
    width: 55,
    height: 55,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  trackPlayingIconIndicator: {
    position: "absolute",
    top: 17.5,
    left: 28.5,
    width: 20,
    height: 20,
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
