import { Colors } from "@/constants/Colors";
import { usePlaylists } from "@/store/library";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlaylistScreen() {
  const { playlists, createNewPlaylist } = usePlaylists();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const playlistArray = Object.entries(playlists).map(([name, tracks]) => ({
    name,
    thumbnail: tracks.length > 0 ? tracks[0].thumbnail : null,
  }));

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      ToastAndroid.show(
        "Please enter a valid playlist name.",
        ToastAndroid.LONG
      );
      return;
    }
    if (playlists[newPlaylistName]) {
      ToastAndroid.show(
        "A playlist with this name already exists.",
        ToastAndroid.LONG
      );
      return;
    }

    createNewPlaylist(newPlaylistName.trim());
    setModalVisible(false);
    setNewPlaylistName("");
    ToastAndroid.show(
      `Playlist "${newPlaylistName}" created!`,
      ToastAndroid.SHORT
    );
  };

  const renderPlaylist = ({
    item,
  }: {
    item: { name: string; thumbnail: string | null };
  }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => {
        router.push({
          pathname: `/(tabs)/playlists/[playlistName]`,
          params: { playlistName: item.name },
        });
        console.log(`Selected playlist: ${item.name}`);
      }}
    >
      <Image
        source={{
          uri: item.thumbnail || "https://placehold.co/100",
        }}
        style={styles.thumbnail}
      />
      <Text style={styles.playlistName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
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

      {/* Create Playlist Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter playlist name"
              placeholderTextColor="#999"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    color: "white",
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButtonText: {
    color: "white",
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderColor: "#333",
    borderWidth: 1,
  },
});
