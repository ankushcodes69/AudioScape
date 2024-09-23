import React, { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator, Alert } from "react-native";
import { HomeFeed } from "@/components/HomeFeed";
import { ThemedView } from "@/components/ThemedView";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import innertube from "@/components/yt";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface HomeFeedType {
  sections?: (MusicCarouselShelf | MusicTasteBuilderShelf)[];
}

interface MusicCarouselShelf {
  contents?: any[];
}

interface MusicTasteBuilderShelf {}

function isMusicCarouselShelf(
  section: MusicCarouselShelf | MusicTasteBuilderShelf
): section is MusicCarouselShelf {
  return "contents" in section;
}

export default function HomeScreen() {
  const [homeFeedResults, setHomeFeedResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { playAudio } = useMusicPlayer();

  useEffect(() => {
    const getHomeFeed = async () => {
      setIsLoading(true);
      try {
        const yt = await innertube;
        const homeFeed: HomeFeedType = await yt.music.getHomeFeed();

        if (homeFeed?.sections && homeFeed.sections.length > 0) {
          const firstSection = homeFeed.sections[0];

          if (
            isMusicCarouselShelf(firstSection) &&
            Array.isArray(firstSection.contents)
          ) {
            const formattedResults: SearchResult[] = firstSection.contents
              .filter((item: any) => item?.id && item?.title)
              .map((item: any) => ({
                id: item.id,
                title: item.title,
                artist: item.artists?.[0]?.name ?? "Unknown Artist",
                thumbnail:
                  item.thumbnail?.contents?.[0]?.url ??
                  "https://via.placeholder.com/50",
              }));
            setHomeFeedResults(formattedResults);
          } else {
            setHomeFeedResults([]);
            Alert.alert("No results", "No songs found in the home feed.");
          }
        } else {
          setHomeFeedResults([]);
          Alert.alert("No results", "Unable to fetch home feed.");
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "An error occurred while fetching the home feed. Please try again."
        );
      }
      setIsLoading(false);
    };

    getHomeFeed();
  }, []);

  const handleSongSelect = (song: SearchResult) => {
    playAudio(song);
  };

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <HomeFeed results={homeFeedResults} onItemClick={handleSongSelect} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
  },
});
