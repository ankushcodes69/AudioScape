import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import color from "color";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useActiveTrack } from "react-native-track-player";
import { usePlayerBackground } from "@/hooks/usePlayerBackground";
import { FloatingPlayer } from "@/components/FloatingPlayer";

function TabLayoutContent() {
  const activeTrack = useActiveTrack();
  const { imageColors } = usePlayerBackground(
    activeTrack?.artwork ?? "https://via.placeholder.com/50"
  );
  const dominantColor = activeTrack ? imageColors?.dominant : "#1d1d1d";
  const darkerColor =
    dominantColor === "#1d1d1d"
      ? "#1d1d1d"
      : color(dominantColor).darken(0.5).hex();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            borderTopWidth: 0,
            paddingTop: 2,
          },
          tabBarLabelStyle: {
            fontSize: 10,
          },
          tabBarActiveTintColor: Colors.tint,
          headerShown: false,
          tabBarBackground: () => (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                overflow: "hidden",
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                backgroundColor: darkerColor,
              }}
            />
          ),
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
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "heart" : "heart-outline"}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            tabBarButton: () => <View />,
          }}
        />
      </Tabs>

      <FloatingPlayer
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          bottom: 60,
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  return <TabLayoutContent />;
}
