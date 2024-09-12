import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { Audio } from "expo-av";
import innertube from "@/components/yt";

type SoundType = Audio.Sound | null;

export default function HomeScreen() {
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [sound, setSound] = useState<SoundType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Error configuring audio mode:", error);
      }
    };

    configureAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const extractVideoId = (url: string): string => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const match = url.match(regExp);

    return match ? match[1] : "";
  };

  const handleInputChange = (text: string) => {
    setYoutubeUrl(text);
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      await playAudio();
    }
  };

  const playAudio = async () => {
    if (!youtubeUrl) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      setIsLoading(true);

      const yt = await innertube;
      const info = await yt.getBasicInfo(extractVideoId(youtubeUrl));
      const streamUrl = `${info.streaming_data?.formats[0].decipher(
        yt.session.player
      )}`;

      // Set the thumbnail
      if (info.basic_info.thumbnail) {
        setThumbnail(info.basic_info.thumbnail[0].url);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YouTube Music Player</Text>
      <TextInput
        style={styles.input}
        onChangeText={handleInputChange}
        value={youtubeUrl}
        placeholder="Enter YouTube URL"
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={togglePlayPause}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{isPlaying ? "Pause" : "Play"}</Text>
        )}
      </TouchableOpacity>
      {thumbnail && (
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    width: "100%",
    height: 40,
    color: "white",
    backgroundColor: "#333",
    borderColor: "#444",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  thumbnail: {
    width: 200,
    height: 150,
    marginTop: 20,
  },
});
