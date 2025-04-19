import React, { useState } from "react";
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
import { FAB, Divider } from "react-native-paper";
import LoaderKit from "react-native-loader-kit";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useActiveTrack } from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { usePlaylists } from "@/store/library";
import { MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
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
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const lastActiveTrack = useLastActiveTrack();
  const activeTrack = useActiveTrack();
  const { playAudio, playPlaylist } = useMusicPlayer();
  const { playlistName } = useLocalSearchParams<{ playlistName: string }>();

  const { playlists } = usePlaylists();

  const playlist = playlists[playlistName];

  const isFloatingPlayerNotVisible = !(activeTrack ?? lastActiveTrack);

  const handleSongSelect = (song: TrackInfo) => {
    playAudio(song);
  };

  return (
    <FullScreenGradientBackground index={gradientIndex}>
      <View style={[styles.container, { paddingTop: top }]}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={Colors.text}
            style={{ position: "absolute", left: 0 }}
            onPress={() => router.back()}
          />
          <Text style={styles.headerText}>{playlistName}</Text>
        </View>

        {isScrolling && (
          <Divider
            style={{
              backgroundColor: "rgba(255,255,255,0.3)",
              height: 0.3,
              marginHorizontal: -15,
            }}
          />
        )}

        <ScrollView
          contentContainerStyle={{ paddingBottom: 145 }}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const currentScrollPosition =
              Math.floor(e.nativeEvent.contentOffset.y) || 0;
            setIsScrolling(currentScrollPosition > 0);
          }}
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
                      params: {
                        songData: songData,
                        type: "playlistSong",
                        playlistName: playlistName,
                      },
                    });
                  }}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Entypo name="dots-three-vertical" size={15} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {playlist.length !== 0 && (
            <Text
              style={{
                color: Colors.textMuted,
                textAlign: "center",
                fontSize: 15,
              }}
            >
              {playlist.length} {`Track${playlist.length > 1 ? "s" : ""}`}
            </Text>
          )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    maxWidth: Dimensions.get("window").width - 90,
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
    marginBottom: 20,
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
