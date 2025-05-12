//test pr

import React from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { ScaledSheet } from "react-native-size-matters/extend";

const DARK_LYRICS_COLOR = "rgba(255,255,255, 0.4)";
const DEFAULT_COLOR = "#555555";

export interface LyricsProps {
  data: {
    text: string;
    startTime?: number;
    endTime?: number; // Added to track when a line ends
  };
  seekTime: SharedValue<number>;
  nextLineStartTime?: number; // Pass the start time of the next line
}

export default function Lyrics({
  data,
  seekTime,
  nextLineStartTime,
}: LyricsProps) {
  // Safely handle the startTime property with proper fallbacks
  const startTime = data?.startTime ?? 0;

  const lyricsColor = useDerivedValue(() => {
    // Safety check for data existence
    if (!data || !data.text) {
      return DEFAULT_COLOR;
    }

    // Note: seekTime (position) is in seconds
    const thresholdInSeconds = 0.2; // 200ms in seconds

    // Determine when this line ends - either using the next line's start time or a calculated duration
    const endTime = nextLineStartTime || data.endTime || startTime + 10; // Default to 5 seconds if no end time

    // Current line is active when seekTime is between startTime and endTime
    if (
      seekTime.value >= startTime - thresholdInSeconds &&
      seekTime.value < endTime
    ) {
      // Animate to white when approaching or at the current line
      return withTiming("white", {
        duration: 150,
      });
    } else {
      // Line is either not yet reached or already passed
      return DARK_LYRICS_COLOR;
    }
  });

  const lyricsStyle = useAnimatedStyle(() => {
    return {
      color: lyricsColor.value,
    };
  });

  // If no data or text is provided, return empty text to prevent crashes
  if (!data || !data.text) {
    return null;
  }

  return (
    <Animated.Text
      style={[styles.text, lyricsStyle]}
      key={`${startTime}-${data.text}`}
    >
      {data.text}
    </Animated.Text>
  );
}

const styles = ScaledSheet.create({
  text: {
    fontWeight: "700",
    fontSize: "24@ms",
    paddingVertical: 9,
  },
});
