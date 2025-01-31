import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  ToastAndroid,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActiveTrack } from "react-native-track-player";
import { usePlaylists } from "@/store/library";
import { Colors } from "@/constants/Colors";
import VerticalDismiss from "@/components/navigation/VerticalArrowDismiss";
import CreatePlaylistModal from "@/app/(modals)/createPlaylist";
import { Entypo } from "@expo/vector-icons";

const { height: screenHeight } = Dimensions.get("window");

export default function AddToPlaylistModal() {
  const { playlists, addTrackToPlaylist, createNewPlaylist } = usePlaylists();
  const { bottom } = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
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

  const renderPlaylistItem = (
    { item }: { item: { name: string; thumbnail: string | null } },
    handleDismiss: () => void
  ) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => {
        ToastAndroid.show(`Added song to ${item.name}`, ToastAndroid.SHORT);
        addTrackToPlaylist(
          {
            id: activeTrack?.id,
            title: activeTrack?.title || "",
            artist: activeTrack?.artist || "",
            thumbnail: activeTrack?.artwork || "https://placehold.co/50",
          },
          item.name
        );
        handleDismiss();
        console.log(`Selected playlist: ${item.name}`);
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
  );

  return (
    <VerticalDismiss>
      {(handleDismiss) => (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Entypo
                name="chevron-down"
                size={28}
                style={styles.dismissButton}
                activeOpacity={0.7}
                color={Colors.text}
                onPress={handleDismiss}
              />

              <Text style={styles.modalTitle}>Choose a playlist</Text>

              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.createButtonText}>+ New Playlist</Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingBottom: bottom + 30 }}>
              <FlatList
                data={playlistArray}
                keyExtractor={(item) => item.name}
                renderItem={(props) => renderPlaylistItem(props, handleDismiss)}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.flatListContent}
              />
            </View>

            <CreatePlaylistModal
              visible={modalVisible}
              onCreate={handleCreatePlaylist}
              onCancel={() => setModalVisible(false)}
            />
          </View>
        </View>
      )}
    </VerticalDismiss>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: screenHeight * 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dismissButton: {
    marginTop: -11,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
    marginLeft: -20,
  },
  flatListContent: {
    flexGrow: 1,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  playlistName: {
    fontSize: 16,
    color: Colors.text,
  },
  createButton: {
    backgroundColor: "white",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 100,
    marginBottom: 10,
  },
  createButtonText: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
  },
});
