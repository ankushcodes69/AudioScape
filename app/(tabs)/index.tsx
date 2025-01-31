import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  View,
  Text,
  ScrollView,
} from "react-native";
import { QuickPicksSection } from "@/components/QuickPicksSection";
import { TrendingSection } from "@/components/TrendingSection";
import innertube from "@/youtube";
import Innertube from "youtubei.js";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";

interface FeedResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface FeedType {
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
  const [quickPicksResults, setQuickPicksResults] = useState<FeedResult[]>([]);
  const [trendingResults, setTrendingResults] = useState<FeedResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { top, bottom } = useSafeAreaInsets();
  const { playAudio } = useMusicPlayer();
  const router = useRouter();

  const getQuickPicks = async (yt: Innertube) => {
    try {
      const homeFeed: FeedType = await yt.music.getHomeFeed();

      if (homeFeed?.sections && homeFeed.sections.length > 0) {
        const quickPicks = homeFeed.sections[0];

        if (
          isMusicCarouselShelf(quickPicks) &&
          Array.isArray(quickPicks.contents)
        ) {
          const formattedResults: FeedResult[] = quickPicks.contents
            .filter((item: any) => item?.id && item?.title)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              artist: item.artists?.[0]?.name ?? "Unknown Artist",
              thumbnail:
                item.thumbnail?.contents?.[0]?.url ?? "https://placehold.co/50",
            }));
          setQuickPicksResults(formattedResults);
        } else {
          setQuickPicksResults([]);
          Alert.alert("No results", "No songs found in the home feed.");
        }
      } else {
        setQuickPicksResults([]);
        Alert.alert("No results", "Unable to fetch home feed.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while fetching the home feed. Please try again."
      );
    }
  };

  const getTrending = async (yt: Innertube) => {
    try {
      const exploreFeed: FeedType = await yt.music.getExplore();

      if (exploreFeed?.sections && exploreFeed.sections.length > 0) {
        const trending = exploreFeed.sections[3];

        if (
          isMusicCarouselShelf(trending) &&
          Array.isArray(trending.contents)
        ) {
          const formattedResults: FeedResult[] = trending.contents
            .filter((item: any) => item?.id && item?.title)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              artist: item.authors?.[0]?.name ?? "Unknown Artist",
              thumbnail:
                item.thumbnail?.contents?.[0]?.url ?? "https://placehold.co/50",
            }));
          setTrendingResults(formattedResults);
        } else {
          setTrendingResults([]);
          Alert.alert("No results", "No songs found in the home feed.");
        }
      } else {
        setTrendingResults([]);
        Alert.alert("No results", "Unable to fetch home feed.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while fetching the home feed. Please try again."
      );
    }
  };

  useEffect(() => {
    async function getHomeFeed() {
      setIsLoading(true);
      const yt = await innertube;
      await getQuickPicks(yt);
      await getTrending(yt);
      setIsLoading(false);
    }

    getHomeFeed();
  }, []);

  const handleSongSelect = (song: FeedResult) => {
    playAudio(song);
  };

  return (
    <View
      style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/transparent-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>AudioScape</Text>
        <View style={{ marginLeft: "auto" }}>
          <EvilIcons
            name={"search"}
            color={"white"}
            size={35}
            onPress={() => {
              router.navigate("/(tabs)/search");
            }}
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color="white" size="large" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <QuickPicksSection
            results={quickPicksResults}
            onItemClick={handleSongSelect}
          />
          <TrendingSection
            results={trendingResults}
            onItemClick={handleSongSelect}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingBottom: 90,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 5,
    borderRadius: 50,
  },
});
