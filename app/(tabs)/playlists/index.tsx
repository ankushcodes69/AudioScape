import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { Colors } from "@/constants/Colors";
import { unknownTrackImageUri } from "@/constants/images";
import { usePlaylists } from "@/store/library";
import { useRouter } from "expo-router";
import { AnimatedFAB, Divider } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useActiveTrack } from "react-native-track-player";
import { Entypo } from "@expo/vector-icons";
import { FullScreenGradientBackground } from "@/components/GradientBackground";
import CreatePlaylistModal from "@/app/(modals)/createPlaylist";
import { defaultStyles } from "@/styles";

const gradientIndex = Math.floor(Math.random() * (19 + 1));

export default function PlaylistScreen() {
  const { playlists, createNewPlaylist } = usePlaylists();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const lastActiveTrack = useLastActiveTrack();
  const activeTrack = useActiveTrack();
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isExtended, setIsExtended] = useState(true);

  const isFloatingPlayerNotVisible = !(activeTrack ?? lastActiveTrack);

  const playlistArray = Object.entries(playlists).map(([name, tracks]) => ({
    name,
    thumbnail: tracks.length > 0 ? tracks[0].thumbnail : null,
  }));

  const handleCreatePlaylist = (playlistName: string) => {
    if (playlists[playlistName]) {
      console.warn("A playlist with this name already exists.");
      return;
    }
    createNewPlaylist(playlistName);
    setModalVisible(false);
  };

  const renderPlaylist = ({
    item,
  }: {
    item: { name: string; thumbnail: string | null };
  }) => (
    <View key={item.name} style={styles.playlistItem}>
      <TouchableOpacity
        style={styles.playlistItemTouchableArea}
        onPress={() => {
          router.push({
            pathname: `/(tabs)/playlists/[playlistName]`,
            params: { playlistName: item.name },
          });
        }}
      >
        <FastImage
          source={{ uri: item.thumbnail ?? unknownTrackImageUri }}
          style={styles.thumbnail}
        />
        <Text style={styles.playlistName}>{item.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          // Convert the song object to a JSON string
          const playlistData = JSON.stringify({
            name: item.name,
            thumbnail: item.thumbnail,
          });

          router.push({
            pathname: "/(modals)/menu",
            params: { playlistData: playlistData, type: "playlist" },
          });
        }}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Entypo name="dots-three-vertical" size={15} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <FullScreenGradientBackground index={gradientIndex}>
      <View style={[defaultStyles.container, { paddingTop: top }]}>
        <Text style={styles.header}>Playlists</Text>

        {isScrolling && (
          <Divider
            style={{ backgroundColor: "rgba(255,255,255,0.3)", height: 0.3 }}
          />
        )}

        <ScrollView
          style={styles.playlistList}
          contentContainerStyle={[
            styles.scrollContainer,
            playlistArray.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const currentScrollPosition =
              Math.floor(e.nativeEvent.contentOffset.y) || 0;
            setIsScrolling(currentScrollPosition > 0);
            setIsExtended(currentScrollPosition <= 0);
          }}
        >
          {playlistArray.length === 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.text,
                  textAlign: "center",
                  fontSize: 18,
                }}
              >
                No playlists found! {"\n"}Create a playlist and start adding
                your favorite songs.
              </Text>
            </View>
          ) : (
            playlistArray.map((item) => renderPlaylist({ item }))
          )}
          {playlistArray.length !== 0 && (
            <Text
              style={{
                color: Colors.textMuted,
                textAlign: "center",
                fontSize: 15,
              }}
            >
              {playlistArray.length}{" "}
              {`Playlist${playlistArray.length > 1 ? "s" : ""}`}
            </Text>
          )}
        </ScrollView>

        <AnimatedFAB
          style={{
            position: "absolute",
            marginRight: 16,
            marginBottom: isFloatingPlayerNotVisible ? 16 : 90,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
          }}
          theme={{ roundness: 1 }}
          icon="plus"
          label="Create Playlist"
          color="black"
          extended={isExtended}
          animateFrom={"right"}
          onPress={() => setModalVisible(true)}
        />

        <CreatePlaylistModal
          visible={modalVisible}
          onCreate={handleCreatePlaylist}
          onCancel={() => setModalVisible(false)}
        />
      </View>
    </FullScreenGradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  scrollContainer: {
    paddingBottom: 145,
  },
  playlistList: {
    flexDirection: "column",
    width: "100%",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 30,
  },
  playlistItemTouchableArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 15,
  },
  playlistName: {
    fontSize: 16,
    color: "white",
    flex: 1,
  },
});
