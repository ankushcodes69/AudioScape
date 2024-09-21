import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  MusicPlayerProvider,
  useMusicPlayer,
} from "@/components/MusicPlayerContext";

function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const { currentSong } = useMusicPlayer();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            paddingBottom: currentSong ? 60 : 0, // Add padding when a song is playing
          },
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "home" : "home-outline"}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "search" : "search-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

export default function TabLayout() {
  return (
    <MusicPlayerProvider>
      <TabLayoutContent />
    </MusicPlayerProvider>
  );
}
