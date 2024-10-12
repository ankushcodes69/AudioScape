import {
  PlayPauseButton,
  SkipToNextButton,
  SkipToPreviousButton,
} from "@/components/PlayerControls";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  View,
  ViewProps,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useActiveTrack } from "react-native-track-player";
import { MovingText } from "@/components/MovingText";

const screenWidth = Dimensions.get("window").width;

export const FloatingPlayer = ({ style }: ViewProps) => {
  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();
  const router = useRouter();

  const displayedTrack = activeTrack ?? lastActiveTrack;

  const handlePress = () => {
    router.navigate("/player");
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  };

  if (!displayedTrack) return null;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.5}
        style={styles.touchableArea}
      >
        <Image
          source={{
            uri: displayedTrack.artwork,
          }}
          style={styles.trackArtworkImage}
        />

        <View style={styles.trackTitleContainer}>
          <MovingText
            style={styles.trackTitle}
            text={displayedTrack.title ?? ""}
            animationThreshold={20}
          />
          <MovingText
            style={styles.trackArtist}
            text={displayedTrack.artist ?? ""}
            animationThreshold={50}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.trackControlsContainer}
      >
        <SkipToPreviousButton iconSize={22} />
        <PlayPauseButton iconSize={22} />
        <SkipToNextButton iconSize={22} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1d1d1d",
    padding: 8,
    borderRadius: 0,
    paddingVertical: 8,
    width: screenWidth,
  },
  touchableArea: {
    flexDirection: "row",
    alignItems: "center",
    width: screenWidth - 120,
  },
  trackArtworkImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 8,
  },
  trackTitleContainer: {
    flex: 1,
    overflow: "hidden",
    marginLeft: 10,
  },
  trackTitle: {
    color: "#f2f2f0",
    fontSize: 18,
    fontWeight: "600",
    paddingLeft: 0,
  },
  trackArtist: {
    color: "#a9a9a9",
    fontSize: 12,
    fontWeight: "500",
    paddingLeft: 0,
  },
  trackControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 18,
    marginRight: 3,
    paddingLeft: 2,
  },
});
