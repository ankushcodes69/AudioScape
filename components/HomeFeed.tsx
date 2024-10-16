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

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface HomeFeedProps {
  results: SearchResult[];
  onItemClick: (item: SearchResult) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({ results, onItemClick }) => {
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = screenWidth * 0.27;
  const itemHeight = itemWidth + 50;

  const renderItem = (item: SearchResult) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.itemContainer, { width: itemWidth, height: itemHeight }]}
      onPress={() => onItemClick(item)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.thumbnail }}
          style={[styles.thumbnail, { width: itemWidth, height: itemWidth }]}
        />
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>▶</Text>
        </View>
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
    <View style={styles.container}>
      <Text style={styles.header}>Quick picks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.rowsContainer}>
          <View style={styles.row}>{topRowItems.map(renderItem)}</View>
          <View style={styles.row}>{bottomRowItems.map(renderItem)}</View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    marginLeft: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 5,
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
    borderRadius: 8,
  },
  playButton: {
    position: "absolute",
    right: 5,
    bottom: 5,
    backgroundColor: "white",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    fontSize: 18,
    bottom: 1.5,
    left: 1,
    color: "black",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  artist: {
    fontSize: 12,
    color: "#888",
  },
});
