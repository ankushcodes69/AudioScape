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
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import innertube from "@/components/yt";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

async function getInfo(inid: string): Promise<Song> {
  const yt = await innertube;
  const info = await yt.music.getInfo(inid);
  const item = info.basic_info;

  return {
    id: inid,
    title: item.title ?? "Unknown Title",
    artist: item.author ?? "Unknown Artist",
    thumbnail:
      item.thumbnail && item.thumbnail[0]
        ? item.thumbnail[0].url
        : "https://via.placeholder.com/50",
  };
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
        const tracks: Song[] = [];
        for (let id of favoritesTracks) {
          const song = await getInfo(id);
          tracks.push(song);
        }
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
      <ThemedView style={styles.resultText}>
        <ThemedText style={styles.resultTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.resultArtist}>{item.artist}</ThemedText>
      </ThemedView>
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
