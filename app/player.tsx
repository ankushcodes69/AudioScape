import { MovingText } from "@/components/MovingText";
import { PlayerControls } from "@/components/PlayerControls";
import { PlayerProgressBar } from "@/components/PlayerProgressbar";
import { fontSize, screenPadding } from "@/constants/tokens";
import { Colors } from "@/constants/Colors";
import { usePlayerBackground } from "@/hooks/usePlayerBackground";
import { useTrackPlayerFavorite } from "@/hooks/useTrackPlayerFavorite";
import { defaultStyles } from "@/styles";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import FastImage from "@d11/react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActiveTrack } from "react-native-track-player";
import VerticalSwipeGesture from "@/components/navigation/VerticalGesture";

const PlayerScreen = () => {
  const activeTrack = useActiveTrack();
  const router = useRouter();

  const { imageColors } = usePlayerBackground(
    activeTrack?.artwork ?? "https://placehold.co/50"
  );

  const { top } = useSafeAreaInsets();

  const { isFavorite, toggleFavoriteFunc } = useTrackPlayerFavorite();

  if (!activeTrack) {
    return (
      <View style={[defaultStyles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={Colors.icon} />
      </View>
    );
  }

  return (
    <VerticalSwipeGesture>
      <LinearGradient
        style={{ flex: 1, borderTopLeftRadius: 25, borderTopRightRadius: 25 }}
        colors={
          imageColors
            ? [imageColors.average, imageColors.dominant]
            : [Colors.background, "#000"]
        }
      >
        <View style={styles.overlayContainer}>
          <DismissPlayerSymbol />

          <View style={{ flex: 1, marginTop: top + 50 }}>
            <View style={styles.artworkImageContainer}>
              <FastImage
                source={{
                  uri: activeTrack.artwork,
                  priority: FastImage.priority.high,
                }}
                resizeMode="cover"
                style={styles.artworkImage}
              />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ marginTop: 40 }}>
                <View style={{ height: "15%" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Track title */}
                    <View style={styles.trackTitleContainer}>
                      <MovingText
                        text={activeTrack.title ?? ""}
                        animationThreshold={30}
                        style={styles.trackTitleText}
                      />
                    </View>

                    {/* Favorite button icon*/}
                    <FontAwesome
                      name={isFavorite ? "heart" : "heart-o"}
                      size={22}
                      color={isFavorite ? "#ff0000" : Colors.icon}
                      style={{ marginHorizontal: 14 }}
                      onPress={() => {
                        toggleFavoriteFunc();
                      }}
                    />
                  </View>

                  {/* Track artist */}
                  {activeTrack.artist && (
                    <Text
                      numberOfLines={1}
                      style={[styles.trackArtistText, { marginTop: 6 }]}
                    >
                      {activeTrack.artist}
                    </Text>
                  )}
                </View>

                <PlayerProgressBar style={{ marginTop: 32 }} />

                <PlayerControls style={{ marginTop: 40, marginBottom: 125 }} />
              </View>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <TouchableOpacity
                activeOpacity={0.5}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                style={styles.bottomButton}
                onPress={() => router.push({ pathname: "/(modals)/queue" })}
              >
                <Text style={styles.queueText}>QUEUE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                style={styles.bottomButton}
                onPress={() => router.push({ pathname: "/(modals)/lyrics" })}
              >
                <Text style={styles.queueText}> LYRICS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </VerticalSwipeGesture>
  );
};

const DismissPlayerSymbol = () => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        top: top + 8,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <View
        accessible={false}
        style={{
          width: 45,
          height: 6,
          borderRadius: 8,
          backgroundColor: "#fff",
          opacity: 0.7,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...defaultStyles.container,
    paddingHorizontal: screenPadding.horizontal,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  artworkImageContainer: {
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 11,
    borderRadius: 12,
    width: Dimensions.get("window").width - 50,
    height: Dimensions.get("window").width - 50,
  },
  artworkImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  trackTitleContainer: {
    flex: 1,
    overflow: "hidden",
  },
  trackTitleText: {
    ...defaultStyles.text,
    fontSize: 22,
    fontWeight: "700",
  },
  trackArtistText: {
    ...defaultStyles.text,
    fontSize: fontSize.base,
    opacity: 0.8,
    maxWidth: "90%",
  },
  queueText: {
    textAlign: "center",
    color: Colors.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  bottomButton: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 18,
    bottom: 35,
    alignSelf: "center",
  },
});

export default PlayerScreen;
