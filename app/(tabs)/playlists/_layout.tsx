import { defaultStyles } from "@/styles";
import { Stack } from "expo-router";
import { View } from "react-native";

const PlaylistsScreenLayout = () => {
  return (
    <View style={defaultStyles.container}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen
          name="[playlistName]"
          options={{
            headerTitle: "",
            headerBackVisible: true,
          }}
        />
      </Stack>
    </View>
  );
};

export default PlaylistsScreenLayout;
