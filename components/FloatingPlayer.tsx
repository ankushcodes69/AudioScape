import {
  PlayPauseButton,
  SkipToNextButton,
  SkipToPreviousButton,
} from "@/components/PlayerControls";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useRouter } from "expo-router";
import { StyleSheet, View, ViewProps, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useActiveTrack } from "react-native-track-player";
import { MovingText } from "@/components/MovingText";

export const FloatingPlayer = ({ style }: ViewProps) => {
  const activeTrack = useActiveTrack();
  const lastActiveTrack = useLastActiveTrack();
  const router = useRouter();

  const displayedTrack = activeTrack ?? lastActiveTrack;

  const handlePress = () => {
    router.navigate("/player");
  };

  if (!displayedTrack) return null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.container, style]}
    >
      <>
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
            animationThreshold={20}
          />
        </View>

        <View style={styles.trackControlsContainer}>
          <SkipToPreviousButton iconSize={22} />
          <PlayPauseButton iconSize={24} />
          <SkipToNextButton iconSize={22} />
        </View>
      </>
    </TouchableOpacity>
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
    columnGap: 20,
    marginRight: 5,
    paddingLeft: 6,
  },
});
