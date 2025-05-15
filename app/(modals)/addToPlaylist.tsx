import React, { useState, useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ToastAndroid,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActiveTrack } from "react-native-track-player";
import { useLocalSearchParams } from "expo-router";
import { usePlaylists } from "@/store/library";
import { Colors } from "@/constants/Colors";
import { Divider } from "react-native-paper";
import { unknownTrackImageUri } from "@/constants/images";
import VerticalDismiss from "@/components/navigation/VerticalArrowDismiss";
import CreatePlaylistModal from "@/app/(modals)/createPlaylist";
import { Entypo } from "@expo/vector-icons";
import {
  ScaledSheet,
  moderateScale,
  verticalScale,
} from "react-native-size-matters/extend";

export default function AddToPlaylistModal() {
  const { playlists, addTrackToPlaylist, createNewPlaylist } = usePlaylists();
  const { bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const activeTrack = useActiveTrack();
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
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

  const trackFromParams = useMemo(() => {
    return params?.track ? JSON.parse(params.track as string) : null;
  }, [params]);

  const track =
    trackFromParams ??
    (activeTrack
      ? {
          id: activeTrack.id,
          title: activeTrack.title || "",
          artist: activeTrack.artist || "",
          thumbnail: activeTrack.artwork || "https://placehold.co/50",
        }
      : undefined);

  const renderPlaylistItem = (
    { item }: { item: { name: string; thumbnail: string | null } },
    handleDismiss: () => void
  ) => {
    return (
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() => {
          ToastAndroid.show(`Added song to ${item.name}`, ToastAndroid.SHORT);
          if (track) addTrackToPlaylist(track, item.name);
          handleDismiss();
          console.log(`Selected playlist: ${item.name}`);
        }}
      >
        <FastImage
          source={{ uri: item.thumbnail ?? unknownTrackImageUri }}
          style={styles.thumbnail}
        />
        <Text style={styles.playlistName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <VerticalDismiss>
      {(handleDismiss) => (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Entypo
                name="chevron-down"
                size={moderateScale(28)}
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

            {isScrolling && (
              <Divider
                style={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  height: 0.3,
                }}
              />
            )}

            <View>
              <FlatList
                data={playlistArray}
                keyExtractor={(item) => item.name}
                renderItem={(props) => renderPlaylistItem(props, handleDismiss)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingBottom: bottom + 10,
                }}
                onScroll={(e) => {
                  const currentScrollPosition =
                    Math.floor(e.nativeEvent.contentOffset.y) || 0;
                  setIsScrolling(currentScrollPosition > 0);
                }}
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

const styles = ScaledSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  modalContent: {
    backgroundColor: "#101010",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 20,
    maxHeight: verticalScale(736 * 0.6),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dismissButton: {
    marginTop: -11,
  },
  modalTitle: {
    fontSize: "18@ms",
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
    marginLeft: "-20@s",
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  thumbnail: {
    width: "50@s",
    height: "50@s",
    borderRadius: 8,
    marginRight: 15,
  },
  playlistName: {
    fontSize: "16@ms",
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
    fontSize: "12@ms",
    fontWeight: "bold",
  },
});
