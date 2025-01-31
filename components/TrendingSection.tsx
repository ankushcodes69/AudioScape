import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Text,
  Dimensions,
} from "react-native";
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
  const createRow = (startIndex: number) => {
    return results
      .filter((_, index) => index % 4 === startIndex)
      .map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={styles.itemContainer}
          onPress={() => onItemClick(item)}
        >
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>{startIndex + 1 + index * 4}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    color: "white",
    fontSize: 25,
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
    marginRight: 16,
    width: 280,
    height: 72,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    color: "#888",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
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
