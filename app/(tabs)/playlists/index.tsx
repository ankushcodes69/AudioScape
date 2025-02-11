import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { usePlaylists } from "@/store/library";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FullScreenGradientBackground } from "@/components/GradientBackground";
import CreatePlaylistModal from "@/app/(modals)/createPlaylist";

const gradientIndex = Math.floor(Math.random() * (19 + 1));

export default function PlaylistScreen() {
  const { playlists, createNewPlaylist, deleteExistingPlaylist } =
    usePlaylists();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

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
        <Image
          source={
            item.thumbnail
              ? { uri: item.thumbnail }
              : require("@/assets/images/unknown_track.png")
          }
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

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Create Playlist</Text>
        </TouchableOpacity>

        <FlatList
          data={playlistArray}
          renderItem={renderPlaylist}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContainer}
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
  createButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  createButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 90,
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
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  playlistName: {
    fontSize: 16,
    color: "white",
    flex: 1,
  },
});
