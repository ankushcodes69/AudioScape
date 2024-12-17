import React, { useState, useEffect } from "react";
import { useFavorites } from "@/store/library";
import { defaultStyles } from "@/styles";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  View,
  Text,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { Colors } from "@/constants/Colors";

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

  return (
    <ScrollView
      style={[
        defaultStyles.container,
        { paddingTop: top, paddingBottom: bottom },
      ]}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.header}>Favorites</Text>

      {/* Loading Indicator */}
      {isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <View style={styles.songList}>
          {formattedTracks.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.searchResult}
              onPress={() => handleSongSelect(item)}
            >
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.resultThumbnail}
              />
              <View style={styles.resultText}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultArtist}>{item.artist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 110,
  },
  header: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  songList: {
    flexDirection: "column",
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
