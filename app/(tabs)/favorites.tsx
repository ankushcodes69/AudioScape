import React, { useState, useEffect } from "react";
import { useFavorites } from "@/store/library";
import { defaultStyles } from "@/styles";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  View,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

const FavoritesScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formattedTracks, setFormattedTracks] = useState<Song[]>([]);
  const { top, bottom } = useSafeAreaInsets();
  const { playAudio } = useMusicPlayer();
  const favoritesTracks = useFavorites().favoriteTracks;

  useEffect(() => {
    const fetchFavoriteTracks = async () => {
      setIsLoading(true);
      try {
        const tracks: Song[] = favoritesTracks;
        setFormattedTracks(tracks);
      } catch (error) {
        console.error("Error fetching favorite tracks", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteTracks();
  }, [favoritesTracks]);

  const handleSongSelect = (song: Song) => {
    playAudio(song);
  };

  const renderSearchResult = ({ item }: { item: Song }) => (
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

  return (
    <View
      style={[
        defaultStyles.container,
        { paddingTop: top, paddingBottom: bottom },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <FlatList
          data={formattedTracks}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          style={styles.searchResults}
        />
      )}
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
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
