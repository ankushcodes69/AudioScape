import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, ViewProps } from "react-native";

interface GradientOverlayProps extends ViewProps {
  index: number;
  children?: React.ReactNode;
  style?: any;
}

const gradientColors = [
  [
    "rgba(58, 30, 79, 0.95)", // Dark purple
    "rgba(35, 16, 50, 0.85)", // Darker purple
    "rgba(20, 8, 30, 0.75)", // Very dark purple
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(25, 35, 75, 0.95)", // Dark blue
    "rgba(15, 20, 45, 0.85)", // Darker blue
    "rgba(8, 10, 25, 0.75)", // Very dark blue
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(25, 45, 35, 0.95)", // Dark green
    "rgba(15, 25, 20, 0.85)", // Darker green
    "rgba(8, 15, 10, 0.75)", // Very dark green
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(75, 25, 35, 0.95)", // Dark red
    "rgba(45, 15, 20, 0.85)", // Darker red
    "rgba(25, 8, 10, 0.75)", // Very dark red
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(45, 50, 55, 0.95)", // Dark grey
    "rgba(30, 35, 40, 0.85)", // Darker grey
    "rgba(15, 18, 20, 0.75)", // Very dark grey
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(25, 40, 55, 0.95)", // Dark blue-grey
    "rgba(15, 25, 35, 0.85)", // Darker blue-grey
    "rgba(8, 12, 18, 0.75)", // Very dark blue-grey
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(45, 25, 55, 0.95)", // Dark purple-grey
    "rgba(30, 15, 35, 0.85)", // Darker purple-grey
    "rgba(15, 8, 18, 0.75)", // Very dark purple-grey
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(65, 45, 25, 0.95)", // Dark bronze
    "rgba(45, 30, 15, 0.85)", // Darker bronze
    "rgba(25, 15, 8, 0.75)", // Very dark bronze
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(65, 20, 25, 0.95)", // Dark red
    "rgba(40, 12, 15, 0.85)", // Darker red
    "rgba(20, 6, 8, 0.75)", // Very dark red
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(20, 45, 45, 0.95)", // Dark teal
    "rgba(12, 30, 30, 0.85)", // Darker teal
    "rgba(6, 15, 15, 0.75)", // Very dark teal
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(55, 25, 35, 0.95)", // Dark rose
    "rgba(35, 15, 22, 0.85)", // Darker rose
    "rgba(18, 8, 12, 0.75)", // Very dark rose
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(35, 30, 65, 0.95)", // Dark indigo
    "rgba(22, 18, 40, 0.85)", // Darker indigo
    "rgba(12, 10, 20, 0.75)", // Very dark indigo
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(35, 45, 25, 0.95)", // Dark moss green
    "rgba(22, 28, 15, 0.85)", // Darker moss
    "rgba(12, 15, 8, 0.75)", // Very dark moss
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(55, 30, 20, 0.95)", // Dark mahogany
    "rgba(35, 18, 12, 0.85)", // Darker mahogany
    "rgba(18, 10, 6, 0.75)", // Very dark mahogany
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(20, 35, 55, 0.95)", // Dark sapphire
    "rgba(12, 22, 35, 0.85)", // Darker sapphire
    "rgba(6, 12, 18, 0.75)", // Very dark sapphire
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(45, 25, 45, 0.95)", // Dark plum
    "rgba(28, 15, 28, 0.85)", // Darker plum
    "rgba(15, 8, 15, 0.75)", // Very dark plum
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(40, 42, 45, 0.95)", // Dark charcoal
    "rgba(25, 27, 30, 0.85)", // Darker charcoal
    "rgba(12, 13, 15, 0.75)", // Very dark charcoal
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(50, 40, 30, 0.95)", // Dark sepia
    "rgba(35, 25, 18, 0.85)", // Darker sepia
    "rgba(18, 12, 8, 0.75)", // Very dark sepia
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(25, 30, 45, 0.95)", // Dark navy
    "rgba(15, 18, 28, 0.85)", // Darker navy
    "rgba(8, 10, 15, 0.75)", // Very dark navy
    "rgba(0, 0, 0, 1)",
  ],
  [
    "rgba(45, 45, 25, 0.95)", // Dark olive
    "rgba(28, 28, 15, 0.85)", // Darker olive
    "rgba(15, 15, 8, 0.75)", // Very dark olive
    "rgba(0, 0, 0, 1)",
  ],
] as const;

export const FullScreenGradientBackground: React.FC<GradientOverlayProps> = ({
  index,
  children,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.fullScreen, style]} {...rest}>
      <LinearGradient
        colors={gradientColors[index]}
        locations={[0, 0.3, 0.5, 0.7]}
        style={styles.gradient}
      />
      <View style={styles.absoluteFill}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    flex: 1,
  },
  absoluteFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
