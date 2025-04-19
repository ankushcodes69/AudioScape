import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Divider } from "react-native-paper";
import { useTrackPlayerFavorite } from "@/hooks/useTrackPlayerFavorite";
import {
  FontAwesome,
  MaterialIcons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { unknownTrackImageUri } from "@/constants/images";
import FastImage from "@d11/react-native-fast-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePlaylists } from "@/store/library";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import VerticalSwipeGesture from "@/components/navigation/VerticalGesture";
import TrackPlayer from "react-native-track-player";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

const { height: screenHeight } = Dimensions.get("window");

export default function MenuModal() {
  const { bottom } = useSafeAreaInsets();
  const { songData, type, playlistName, playlistData } = useLocalSearchParams<{
    songData: string;
    playlistData: string;
    type: string;
    playlistName: string;
  }>();
  const { playNext, playAudio, playPlaylist } = useMusicPlayer();
  const router = useRouter();
  const { playlists, removeTrackFromPlaylist, deleteExistingPlaylist } =
    usePlaylists();

  const { checkIfFavorite, toggleFavoriteFunc } = useTrackPlayerFavorite();

  const selectedSong: Song | null = songData ? JSON.parse(songData) : null;
  const selectedPlaylist: { name: string; thumbnail: string | null } | null =
    playlistData ? JSON.parse(playlistData) : null;

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (selectedSong?.id) {
        const fav = await checkIfFavorite(selectedSong.id);
        setIsFavorite(fav);
      }
    };

    fetchFavoriteStatus();
  }, [selectedSong?.id, checkIfFavorite]);

  const renderSongItem = (song: Song) => (
    <View style={styles.menuHeaderItem}>
      <FastImage
        source={{ uri: song.thumbnail ?? unknownTrackImageUri }}
        style={styles.thumbnail}
      />
      <View style={styles.menuHeaderText}>
        <Text style={styles.menuHeaderTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>

      <FontAwesome
        name={isFavorite ? "heart" : "heart-o"}
        size={22}
        color={isFavorite ? "#ff0000" : Colors.icon}
        onPress={() => {
          toggleFavoriteFunc(song);
          setIsFavorite((prev) => !prev);
        }}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      />
    </View>
  );

  const renderPlaylistItem = ({
    item,
  }: {
    item: { name: string; thumbnail: string | null };
  }) => (
    <View style={styles.menuHeaderItem}>
      <FastImage
        source={{ uri: item.thumbnail ?? unknownTrackImageUri }}
        style={styles.thumbnail}
      />
      <View style={styles.menuHeaderText}>
        <Text style={styles.menuHeaderTitle} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </View>
  );

  const menuItems = [
    {
      types: ["song", "playlistSong", "queueSong"],
      label: "Start radio",
      icon: <Feather name="radio" size={24} color={Colors.text} />,
      onPress: async () => {
        if (selectedSong) await playAudio(selectedSong);
        router.back();
      },
    },
    {
      types: ["song", "playlistSong", "queueSong"],
      label: "Add to playlist",
      icon: <MaterialIcons name="playlist-add" size={26} color={Colors.text} />,
      onPress: async () => {
        await router.push({
          pathname: "/(modals)/addToPlaylist",
          params: selectedSong
            ? { track: JSON.stringify(selectedSong) }
            : undefined,
        });
      },
    },
    {
      types: ["song", "playlistSong", "queueSong"],
      label: "Play next",
      icon: (
        <MaterialIcons name="playlist-play" size={26} color={Colors.text} />
      ),
      onPress: async () => {
        await playNext(selectedSong ? [selectedSong] : null);
        ToastAndroid.show("Song will play next", ToastAndroid.SHORT);
        router.back();
      },
    },
    {
      types: ["queueSong"],
      label: "Remove from queue",
      icon: (
        <MaterialIcons name="playlist-remove" size={26} color={Colors.text} />
      ),
      onPress: async () => {
        if (selectedSong) {
          const queue = await TrackPlayer.getQueue();
          await TrackPlayer.remove(
            queue.findIndex((item) => item.id === selectedSong.id)
          );
          ToastAndroid.show("Song removed from queue", ToastAndroid.SHORT);
        }
        router.back();
      },
    },
    {
      types: ["playlistSong"],
      label: "Remove from playlist",
      icon: (
        <MaterialIcons name="playlist-remove" size={26} color={Colors.text} />
      ),
      onPress: async () => {
        if (selectedSong) {
          await removeTrackFromPlaylist(selectedSong.id, playlistName);
          ToastAndroid.show("Song removed from playlist", ToastAndroid.SHORT);
        }
        router.back();
      },
    },
    {
      types: ["playlist"],
      label: "Play playlist",
      icon: (
        <MaterialIcons name="playlist-play" size={26} color={Colors.text} />
      ),
      onPress: async () => {
        if (selectedPlaylist) {
          const playlistSongs = playlists[selectedPlaylist.name];
          if (playlistSongs.length === 0) return;
          await playPlaylist(playlistSongs);
        }
        router.back();
      },
    },
    {
      types: ["playlist"],
      label: "Play next",
      icon: (
        <MaterialIcons name="playlist-play" size={26} color={Colors.text} />
      ),
      onPress: async () => {
        if (selectedPlaylist) {
          const playlistSongs = playlists[selectedPlaylist.name];
          if (playlistSongs.length === 0) return;
          await playNext(playlistSongs ? playlistSongs : null);
          ToastAndroid.show("Playlist will play next", ToastAndroid.SHORT);
          router.back();
        }
      },
    },
    {
      types: ["playlist"],
      label: "Delete playlist",
      icon: (
        <MaterialCommunityIcons
          name="delete-forever-outline"
          size={24}
          color={Colors.text}
        />
      ),
      onPress: async () => {
        if (selectedPlaylist) {
          await deleteExistingPlaylist(selectedPlaylist.name);
          ToastAndroid.show("Playlist deleted", ToastAndroid.SHORT);
        }
        router.back();
      },
    },
  ];

  return (
    <View style={styles.modalBackground}>
      <VerticalSwipeGesture duration={400}>
        <View style={[styles.modalOverlay, { paddingBottom: bottom + 60 }]}>
          <View style={styles.modalContent}>
            <DismissMenuModalSymbol />
            <View style={{ paddingBottom: bottom }}>
              {selectedSong !== null
                ? renderSongItem(selectedSong)
                : selectedPlaylist !== null && type === "playlist"
                ? renderPlaylistItem({ item: selectedPlaylist })
                : null}
              <Divider
                style={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  height: 0.3,
                }}
              />

              {menuItems
                .filter((item) => item.types.includes(type))
                .map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    {item.icon}
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>
      </VerticalSwipeGesture>
    </View>
  );
}

const DismissMenuModalSymbol = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: 8,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <View
        accessible={false}
        style={{
          width: 30,
          height: 4.5,
          borderRadius: 8,
          backgroundColor: "#fff",
          opacity: 0.7,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  modalContent: {
    backgroundColor: "#151515",
    borderRadius: 10,
    paddingTop: 16,
    paddingBottom: 8,
    height: screenHeight * 0.6,
    width: "95%",
    alignSelf: "center",
  },
  menuHeaderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  thumbnail: {
    width: 35,
    height: 35,
    borderRadius: 8,
    marginRight: 15,
  },
  menuHeaderText: {
    flex: 1,
  },
  menuHeaderTitle: {
    color: Colors.text,
    fontSize: 16,
  },
  songArtist: {
    color: "#999",
    fontSize: 14,
  },
  menuItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItemText: {
    color: Colors.text,
    fontSize: 18,
    paddingLeft: 18,
    fontWeight: "400",
  },
});
