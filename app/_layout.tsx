import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import "react-native-reanimated";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import * as StatusBar from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useSetupTrackPlayer } from "@/hooks/useSetupTrackPlayer";
import { useLogTrackPlayerState } from "@/hooks/useLogTrackPlayerState";
import useNotificationClickHandler from "@/hooks/useNotificationClickHandler";
import TrackPlayer from "react-native-track-player";
import { playbackService } from "@/constants/playbackService";
import { MusicPlayerProvider } from "@/components/MusicPlayerContext";
import { initializeLibrary, store } from "@/store/library";
import { Provider } from "react-redux";

SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => playbackService);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [trackPlayerLoaded, setTrackPlayerLoaded] = useState(false);

  const handleTrackPlayerLoaded = useCallback(async () => {
    await TrackPlayer.reset();
    setTrackPlayerLoaded(true);
  }, []);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoaded,
  });

  useLogTrackPlayerState();
  useNotificationClickHandler();

  useEffect(() => {
    const initialize = async () => {
      await initializeLibrary();
      NavigationBar.setPositionAsync("absolute");
      NavigationBar.setBackgroundColorAsync("#ffffff01");
      NavigationBar.setButtonStyleAsync("dark");
      StatusBar.setStatusBarBackgroundColor("transparent");
      if (fontsLoaded && trackPlayerLoaded) {
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, [fontsLoaded, trackPlayerLoaded]);

  if (!fontsLoaded || !trackPlayerLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <MusicPlayerProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider value={DarkTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="player"
                  options={{
                    presentation: "transparentModal",
                    gestureEnabled: true,
                    gestureDirection: "vertical",
                    animationDuration: 400,
                    headerShown: false,
                  }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </MusicPlayerProvider>
    </Provider>
  );
}
