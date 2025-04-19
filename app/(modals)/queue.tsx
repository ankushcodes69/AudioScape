import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TrackPlayer, {
  Track,
  useTrackPlayerEvents,
  Event,
  useActiveTrack,
} from "react-native-track-player";
import { useRouter } from "expo-router";
import LoaderKit from "react-native-loader-kit";
import { Colors } from "@/constants/Colors";
import { unknownTrackImageUri } from "@/constants/images";
import FastImage from "@d11/react-native-fast-image";
import { Divider } from "react-native-paper";
import VerticalDismiss from "@/components/navigation/VerticalArrowDismiss";
import { Entypo } from "@expo/vector-icons";

const { height: screenHeight } = Dimensions.get("window");

export default function QueueModal() {
  const [queue, setQueue] = useState<Track[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const activeTrack = useActiveTrack();
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const fetchQueue = useCallback(async () => {
    const currentQueue = await TrackPlayer.getQueue();
    setQueue(currentQueue);
    const activeIndex = await TrackPlayer.getActiveTrackIndex();

    if (activeIndex !== undefined && activeIndex !== null)
      setActiveIndex(activeIndex);
    else setActiveIndex(0);
  }, []);

  // Fetch queue on mount
  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Set up polling to check for queue changes
  useEffect(() => {
    const intervalId = setInterval(fetchQueue, 2000); // Check every 2 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchQueue]);

  // Listen for track changes to update in real-time
  useTrackPlayerEvents(
    [Event.PlaybackQueueEnded, Event.PlaybackActiveTrackChanged],
    fetchQueue
  );

  const handleSongSelect = async (song: Track) => {
    await TrackPlayer.skip(queue.indexOf(song));
  };

  const renderSongItem = ({ item, index }: { item: Track; index: number }) => (
    <View
      key={item.id}
      style={[
        styles.songItem,
        activeTrack?.id === item.id && styles.activeSongItem,
      ]}
    >
      <TouchableOpacity
        style={styles.songItemTouchableArea}
        onPress={() => handleSongSelect(item)}
      >
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
        <FastImage
          source={{ uri: item.artwork ?? unknownTrackImageUri }}
          style={styles.thumbnail}
        />
        {activeTrack?.id === item.id && (
          <LoaderKit
            style={styles.trackPlayingIconIndicator}
            name="LineScalePulseOutRapid"
            color={"white"}
          />
        )}
        <View style={styles.songText}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            // Convert the song object to a JSON string
            const songData = JSON.stringify({
              id: item.id,
              title: item.title,
              artist: item.artist,
              thumbnail: item.artwork ?? unknownTrackImageUri,
            });

            router.push({
              pathname: "/(modals)/menu",
              params: { songData: songData, type: "queueSong" },
            });
          }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Entypo name="dots-three-vertical" size={15} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
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
              <Text style={styles.modalTitle}>
                Queue ({activeIndex + 1}/{queue.length})
              </Text>
            </View>

            {isScrolling && (
              <Divider
                style={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  height: 0.3,
                }}
              />
            )}

            <View style={{ paddingBottom: bottom }}>
              <FlatList
                data={queue}
                keyExtractor={(item) => item.id}
                renderItem={renderSongItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                onScroll={(e) => {
                  const currentScrollPosition =
                    Math.floor(e.nativeEvent.contentOffset.y) || 0;
                  setIsScrolling(currentScrollPosition > 0);
                }}
              />
            </View>
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
    backgroundColor: "#101010",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 15,
    maxHeight: screenHeight * 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 20,
  },
  dismissButton: {
    marginTop: -11,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
    marginLeft: 10,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 25,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginHorizontal: 5,
  },
  activeSongItem: {
    backgroundColor: "rgba(255, 255, 255, 0.045)", // Subtle highlight for active track
    borderRadius: 16,
  },
  songItemTouchableArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  indexContainer: {
    width: 40,
    alignItems: "center",
  },
  indexText: {
    color: "#888",
    fontSize: 18,
    fontWeight: "bold",
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  trackPlayingIconIndicator: {
    position: "absolute",
    top: 15,
    left: 56,
    width: 20,
    height: 20,
  },
  songText: {
    flex: 1,
  },
  songTitle: {
    color: Colors.text,
    fontSize: 16,
  },
  songArtist: {
    color: "#999",
    fontSize: 14,
  },
});
