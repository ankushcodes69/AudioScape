import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Dimensions,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import LoaderKit from "react-native-loader-kit";
import { useActiveTrack } from "react-native-track-player";
import { Colors } from "@/constants/Colors";

interface SongItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface QuickPicksSectionProps {
  results: SongItem[];
  onItemClick: (item: SongItem) => void;
}

export const QuickPicksSection: React.FC<QuickPicksSectionProps> = ({
  results,
  onItemClick,
}) => {
  const activeTrack = useActiveTrack();

  const screenWidth = Dimensions.get("window").width;
  const itemWidth = screenWidth * 0.27;
  const itemHeight = itemWidth + 50;

  const renderItem = (item: SongItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.itemContainer, { width: itemWidth, height: itemHeight }]}
      onPress={() => onItemClick(item)}
    >
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: item.thumbnail }}
          style={[styles.thumbnail, { width: itemWidth, height: itemWidth }]}
        />
        {activeTrack?.id === item.id && (
          <LoaderKit
            style={[
              styles.trackPlayingIconIndicator,
              {
                top: itemWidth / 2 - 15,
                left: itemWidth / 2 - 13,
                width: itemWidth * 0.3,
                height: itemWidth * 0.3,
              },
            ]}
            name="LineScalePulseOutRapid"
            color="white"
          />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {item.artist}
      </Text>
    </TouchableOpacity>
  );

  const middleIndex = Math.ceil(results.length / 2);
  const topRowItems = results.slice(0, middleIndex);
  const bottomRowItems = results.slice(middleIndex);

  return (
    <View>
      <Text style={styles.header}>Quick Picks</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 13 }}
      >
        <View style={styles.rowsContainer}>
          <View style={styles.row}>{topRowItems.map(renderItem)}</View>
          <View style={styles.row}>{bottomRowItems.map(renderItem)}</View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 15,
  },
  rowsContainer: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  itemContainer: {
    marginRight: 10,
  },
  imageContainer: {
    position: "relative",
  },
  thumbnail: {
    borderRadius: 12,
  },
  trackPlayingIconIndicator: {
    position: "absolute",
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  artist: {
    fontSize: 12,
    color: "#888",
  },
});
