import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import LoaderKit from "react-native-loader-kit";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { useActiveTrack } from "react-native-track-player";
import { Colors } from "@/constants/Colors";

interface SongItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  rank?: number;
}

interface TrendingSectionProps {
  results: SongItem[];
  onItemClick: (item: SongItem) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  results,
  onItemClick,
}) => {
  const router = useRouter();
  const activeTrack = useActiveTrack();

  const createRow = (startIndex: number) => {
    return results
      .filter((_, index) => index % 4 === startIndex)
      .map((item, index) => (
        <View key={item.id} style={styles.itemContainer}>
          <TouchableOpacity
            key={item.id}
            style={styles.itemTouchableArea}
            onPress={() => onItemClick(item)}
          >
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{startIndex + 1 + index * 4}</Text>
            </View>
            <View style={styles.imageContainer}>
              <FastImage
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
              />
              {activeTrack?.id === item.id && (
                <LoaderKit
                  style={styles.trackPlayingIconIndicator}
                  name="LineScalePulseOutRapid"
                  color="white"
                />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
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
                params: { songData: songData, type: "song" },
              });
            }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Entypo name="dots-three-vertical" size={15} color="white" />
          </TouchableOpacity>
        </View>
      ));
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Trending</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          <View style={styles.row}>{createRow(0)}</View>
          <View style={styles.row}>{createRow(1)}</View>
          <View style={styles.row}>{createRow(2)}</View>
          <View style={styles.row}>{createRow(3)}</View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  gridContainer: {
    paddingLeft: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 28,
    width: 280,
    height: 72,
  },
  itemTouchableArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    color: "#888",
    fontSize: 28,
    fontWeight: "bold",
  },
  imageContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 8,
  },
  trackPlayingIconIndicator: {
    position: "absolute",
    top: 18,
    left: 19,
    width: 20,
    height: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: "#888",
  },
});
