import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useSetupTrackPlayer } from "@/hooks/useSetupTrackPlayer";
import { useLogTrackPlayerState } from "@/hooks/useLogTrackPlayerState";
import TrackPlayer from "react-native-track-player";
import { playbackService } from "@/constants/playbackService";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => playbackService);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [trackPlayerLoaded, setTrackPlayerLoaded] = useState(false);

  const handleTrackPlayerLoaded = useCallback(() => {
    setTrackPlayerLoaded(true);
  }, []);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoaded,
  });

  useLogTrackPlayerState();

  // Effect to hide the splash screen once both the fonts and TrackPlayer have loaded
  useEffect(() => {
    if (fontsLoaded && trackPlayerLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, trackPlayerLoaded]);

  if (!fontsLoaded || !trackPlayerLoaded) {
    return null; // Keep the app waiting until both fonts and TrackPlayer are loaded
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
