import React, { useState, useEffect } from "react";
import { Alert, View, Text, ScrollView, Linking } from "react-native";
import FastImage from "@d11/react-native-fast-image";
import LoaderKit from "react-native-loader-kit";
import { QuickPicksSection } from "@/components/QuickPicksSection";
import { TrendingSection } from "@/components/TrendingSection";
import innertube from "@/youtube";
import Innertube from "youtubei.js";
import { EvilIcons, SimpleLineIcons } from "@expo/vector-icons";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Divider } from "react-native-paper";
import { FullScreenGradientBackground } from "@/components/GradientBackground";
import { transparentIconUri } from "@/constants/images";
import { ScaledSheet, moderateScale } from "react-native-size-matters/extend";

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MusicTasteBuilderShelf {}

function isMusicCarouselShelf(
  section: MusicCarouselShelf | MusicTasteBuilderShelf
): section is MusicCarouselShelf {
  return "contents" in section;
}

const gradientIndex = Math.floor(Math.random() * (19 + 1));

export default function HomeScreen() {
  const [quickPicksResults, setQuickPicksResults] = useState<FeedResult[]>([]);
  const [trendingResults, setTrendingResults] = useState<FeedResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const { top } = useSafeAreaInsets();
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

      console.error("Quick picks fetch error:", error);
    }
  };

  const getTrending = async (yt: Innertube) => {
    try {
      const exploreFeed: FeedType = await yt.music.getExplore();

      if (exploreFeed?.sections && exploreFeed.sections.length > 0) {
        const trending = exploreFeed.sections.find((section) => {
          const anySection = section as any;
          return anySection.header?.title?.text === "Trending";
        });

        if (
          trending &&
          isMusicCarouselShelf(trending) &&
          Array.isArray(trending.contents)
        ) {
          const formattedResults: FeedResult[] = trending.contents
            .filter(
              (item: any) => item?.id && (item?.title || item?.title.text)
            )
            .map((item: any) => ({
              id: item.id,
              title:
                typeof item.title === "string"
                  ? item.title
                  : item.title?.text || "Unknown Title",
              artist:
                item.authors?.[0]?.name ??
                item.author?.name ??
                "Unknown Artist",
              thumbnail:
                item.thumbnail?.contents?.[0]?.url ??
                item.thumbnail?.[0]?.url ??
                "https://placehold.co/50",
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

      console.error("Trending fetch error:", error);
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
    <FullScreenGradientBackground index={gradientIndex}>
      <View style={[styles.container, { paddingTop: top }]}>
        <View style={styles.header}>
          <FastImage
            source={{
              uri: transparentIconUri,
              priority: FastImage.priority.high,
            }}
            style={styles.logo}
          />
          <Text style={styles.headerText}>AudioScape</Text>
          <View
            style={{
              marginLeft: "auto",
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <SimpleLineIcons
              name="equalizer"
              size={moderateScale(20)}
              color="white"
              style={{ marginTop: 5 }}
              onPress={() => {
                Linking.sendIntent(
                  "android.media.action.DISPLAY_AUDIO_EFFECT_CONTROL_PANEL"
                );
              }}
            />
            <EvilIcons
              name={"search"}
              color={"white"}
              size={moderateScale(35)}
              onPress={() => {
                router.navigate("/(tabs)/search");
              }}
            />
          </View>
        </View>

        {isScrolling && (
          <Divider
            style={{ backgroundColor: "rgba(255,255,255,0.3)", height: 0.3 }}
          />
        )}

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <LoaderKit
              style={{
                width: moderateScale(50),
                height: moderateScale(50),
                alignSelf: "center",
              }}
              name="BallSpinFadeLoader"
              color="white"
            />
            <Text
              style={{
                color: "white",
                textAlign: "center",
                flexWrap: "wrap",
                fontSize: moderateScale(16),
              }}
            >
              Please Wait Sometimes It May Take Longer Than Usual To Load
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            onScroll={(e) => {
              const currentScrollPosition =
                Math.floor(e.nativeEvent.contentOffset.y) || 0;
              setIsScrolling(currentScrollPosition > 0);
            }}
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
    </FullScreenGradientBackground>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  scrollContainer: {
    paddingBottom: "90@vs",
    marginTop: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  headerText: {
    fontSize: "18@ms",
    fontWeight: "bold",
    color: "white",
  },
  logo: {
    width: "42@ms",
    height: "42@ms",
    marginRight: 5,
    borderRadius: 50,
  },
});
