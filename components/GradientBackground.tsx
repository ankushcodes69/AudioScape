import React from "react";
import {
  StyleSheet,
  View,
  ViewProps,
  ImageBackground,
  ImageSourcePropType,
} from "react-native";

interface BackgroundImageProps extends ViewProps {
  index: number;
  children?: React.ReactNode;
  style?: any;
}

const backgroundImages: ImageSourcePropType[] = [
  require("@/assets/images/backgroundGradients/gradient-0.png"),
  require("@/assets/images/backgroundGradients/gradient-1.png"),
  require("@/assets/images/backgroundGradients/gradient-2.png"),
  require("@/assets/images/backgroundGradients/gradient-3.png"),
  require("@/assets/images/backgroundGradients/gradient-4.png"),
  require("@/assets/images/backgroundGradients/gradient-5.png"),
  require("@/assets/images/backgroundGradients/gradient-6.png"),
  require("@/assets/images/backgroundGradients/gradient-7.png"),
  require("@/assets/images/backgroundGradients/gradient-8.png"),
  require("@/assets/images/backgroundGradients/gradient-9.png"),
  require("@/assets/images/backgroundGradients/gradient-10.png"),
  require("@/assets/images/backgroundGradients/gradient-11.png"),
];

const FullScreenGradientBackground: React.FC<BackgroundImageProps> = ({
  index,
  children,
  style,
  ...rest
}) => {
  const imageSource = backgroundImages[index % backgroundImages.length];

  return (
    <View style={[styles.outerContainer, style]} {...rest}>
      <ImageBackground
        source={imageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.childrenContainer}>{children}</View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000", // Fallback background color
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  childrenContainer: {
    flex: 1,
  },
});

export { FullScreenGradientBackground };
