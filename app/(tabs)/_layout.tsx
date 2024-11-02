import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { FloatingPlayer } from "@/components/FloatingPlayer";

function TabLayoutContent() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
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
                backgroundColor: "#1A1A1A",
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
