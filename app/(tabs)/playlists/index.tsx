import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { Colors } from "@/constants/Colors";
import { unknownTrackImageUri } from "@/constants/images";
import { usePlaylists } from "@/store/library";
import { useRouter } from "expo-router";
import { AnimatedFAB } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useActiveTrack } from "react-native-track-player";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FullScreenGradientBackground } from "@/components/GradientBackground";
import CreatePlaylistModal from "@/app/(modals)/createPlaylist";

const gradientIndex = Math.floor(Math.random() * (19 + 1));

export default function PlaylistScreen() {
  const { playlists, createNewPlaylist, deleteExistingPlaylist } =
    usePlaylists();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const lastActiveTrack = useLastActiveTrack();
  const activeTrack = useActiveTrack();
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
    <View style={styles.playlistItem}>
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
      <MaterialCommunityIcons
        name="delete-forever-outline"
        size={24}
        color="#530000"
        onPress={() => deleteExistingPlaylist(item.name)}
      />
    </View>
  );

  return (
    <FullScreenGradientBackground index={gradientIndex}>
      <SafeAreaView style={[styles.container, { paddingTop: top }]}>
        <Text style={styles.header}>Playlists</Text>

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
                marginTop: -top - 20,
              }}
            >
              No playlists found! {"\n"}Create a playlist and start adding your
              favorite songs.
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlistArray}
            renderItem={renderPlaylist}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.listContainer}
            onScroll={(e) => {
              const currentScrollPosition =
                Math.floor(e.nativeEvent.contentOffset.y) || 0;
              setIsExtended(currentScrollPosition <= 0);
            }}
          />
        )}
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
      </SafeAreaView>
    </FullScreenGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 145,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  playlistItemTouchableArea: {
    flexDirection: "row",
    alignItems: "center",
    width: Dimensions.get("window").width - 60,
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
