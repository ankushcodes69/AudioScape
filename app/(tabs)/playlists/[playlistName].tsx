import React from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { unknownTrackImageUri } from "@/constants/images";
import { FAB } from "react-native-paper";
import LoaderKit from "react-native-loader-kit";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useActiveTrack } from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { usePlaylists } from "@/store/library";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FastImage from "@d11/react-native-fast-image";
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
  const lastActiveTrack = useLastActiveTrack();
  const activeTrack = useActiveTrack();
  const { playAudio, playPlaylist } = useMusicPlayer();
  const { playlistName } = useLocalSearchParams<{ playlistName: string }>();

  const { playlists, removeTrackFromPlaylist } = usePlaylists();

  const playlist = playlists[playlistName];

  const isFloatingPlayerNotVisible = !(activeTrack ?? lastActiveTrack);

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
          contentContainerStyle={{ paddingBottom: 145 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Artwork Image */}
          <View style={styles.artworkImageContainer}>
            <FastImage
              source={{
                uri: playlist[0]?.thumbnail ?? unknownTrackImageUri,
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

        <FAB
          style={{
            position: "absolute",
            marginRight: 16,
            marginBottom: isFloatingPlayerNotVisible ? 16 : 90,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
          }}
          theme={{ roundness: 7 }}
          icon="play"
          color="black"
          onPress={async () => {
            if (playlist.length === 0) return;
            await playPlaylist(playlist);
            await router.navigate("/player");
          }}
        />
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
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 11,
    borderRadius: 12,
    alignSelf: "center",
    height: Dimensions.get("window").width - 120,
    width: Dimensions.get("window").width - 120,
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
    width: 55,
    height: 55,
    marginRight: 10,
    borderRadius: 8,
  },
  trackPlayingIconIndicator: {
    position: "absolute",
    top: 18,
    left: 19,
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
