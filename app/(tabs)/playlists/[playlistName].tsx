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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { usePlaylists } from "@/store/library";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FastImage from "react-native-fast-image";
import { FullScreenGradientBackground } from "@/components/GradientBackground";

interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

const gradientIndex = Math.floor(Math.random() * (19 + 1));

const PlaylistView = () => {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { playAudio } = useMusicPlayer();
  const { playlistName } = useLocalSearchParams<{ playlistName: string }>();

  const { playlists, removeTrackFromPlaylist } = usePlaylists();

  const playlist = playlists[playlistName];

  const handleSongSelect = (song: TrackInfo) => {
    playAudio(song);
  };

  return (
    <FullScreenGradientBackground index={gradientIndex}>
      <View style={[styles.container, { paddingTop: top }]}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={28}
          color={Colors.text}
          style={{ paddingTop: 8 }}
          onPress={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Artwork Image */}
          <View style={styles.artworkImageContainer}>
            <FastImage
              source={
                playlist[0]
                  ? {
                      uri: playlist[0]?.thumbnail,
                      priority: FastImage.priority.high,
                    }
                  : require("@/assets/images/unknown_track.png")
              }
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
      </View>
    </FullScreenGradientBackground>
  );
};

export default PlaylistView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingBottom: 0,
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
