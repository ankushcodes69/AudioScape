import React from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { usePlaylists } from "@/store/library";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FastImage from "react-native-fast-image";

interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

const PlaylistView = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { playAudio } = useMusicPlayer();
  const { playlistName } = useLocalSearchParams<{ playlistName: string }>();

  const { playlists, removeTrackFromPlaylist } = usePlaylists();

  const playlist = playlists[playlistName];

  const handleSongSelect = (song: TrackInfo) => {
    playAudio(song);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
      contentContainerStyle={{ paddingBottom: bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Artwork Image */}
      <View style={styles.artworkImageContainer}>
        <FastImage
          source={{
            uri: playlist[0]?.thumbnail,
            priority: FastImage.priority.high,
          }}
          style={styles.artworkImage}
        />
      </View>

      <Text style={styles.header}>{playlistName}</Text>

      <View>
        {playlist.map((item: TrackInfo) => (
          <View key={item.id} style={styles.songItem}>
            <TouchableOpacity
              style={styles.songItemTouchableArea}
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
            <MaterialCommunityIcons
              name="delete-forever-outline"
              size={24}
              color="#530000"
              onPress={() => removeTrackFromPlaylist(item.id, playlistName)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default PlaylistView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.text,
    textAlign: "center",
    marginTop: 10,
  },
  artworkImageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    height: Dimensions.get("window").width - 120,
  },
  artworkImage: {
    width: Dimensions.get("window").width - 120,
    height: Dimensions.get("window").width - 120,
    resizeMode: "cover",
    borderRadius: 12,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  songItemTouchableArea: {
    flexDirection: "row",
    alignItems: "center",
    width: Dimensions.get("window").width - 60,
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
