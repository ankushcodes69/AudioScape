import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  ToastAndroid,
} from "react-native";
import { useActiveTrack } from "react-native-track-player";
import { usePlaylists } from "@/store/library";
import { Colors } from "@/constants/Colors";
import VerticalSwipeGesture from "@/components/navigation/VerticalGesture";

export default function AddToPlaylistModal() {
  const { playlists, addTrackToPlaylist } = usePlaylists();
  const activeTrack = useActiveTrack();

  const playlistArray = Object.entries(playlists).map(([name, tracks]) => ({
    name,
    thumbnail: tracks.length > 0 ? tracks[0].thumbnail : null,
  }));

  const renderPlaylistItem = ({
    item,
  }: {
    item: { name: string; thumbnail: string | null };
  }) => (
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
    <VerticalSwipeGesture>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose a playlist</Text>

          {/* Playlist List */}
          <FlatList
            data={playlistArray}
            keyExtractor={(item) => item.name}
            renderItem={renderPlaylistItem}
          />

          {/* New Playlist Button 
          <TouchableOpacity style={styles.newPlaylistButton}>
            <Text style={styles.newPlaylistText}>+ New playlist</Text>
          </TouchableOpacity>
          */}
        </View>
      </View>
    </VerticalSwipeGesture>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
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
    color: Colors.text,
  },
  playlistTracks: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  newPlaylistButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: Colors.background,
    borderRadius: 8,
    alignItems: "center",
  },
  newPlaylistText: {
    color: Colors.text,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
});
