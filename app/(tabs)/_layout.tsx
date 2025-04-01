import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { FloatingPlayer } from "@/components/FloatingPlayer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageModal } from "@/components/MessageModal";
import { UpdateModal } from "@/components/UpdateModal";

function TabLayoutContent() {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            borderTopWidth: 0,
            paddingTop: 1,
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
                backgroundColor: "#101010",
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
          name="playlists"
          options={{
            title: "Playlists",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "list" : "list-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen name="search" options={{ href: null }} />
      </Tabs>
      <FloatingPlayer
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          bottom: bottom + 60,
        }}
      />

      <UpdateModal />
      <MessageModal />
    </View>
  );
}

export default function TabLayout() {
  return <TabLayoutContent />;
}
