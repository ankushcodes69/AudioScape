import React, { useState, useEffect } from "react";
import { useFavorites } from "@/store/library";
import { defaultStyles } from "@/styles";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  ScrollView,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import LoaderKit from "react-native-loader-kit";
import Entypo from "@expo/vector-icons/Entypo";
import { FAB, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack";
import { useActiveTrack } from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusicPlayer } from "@/components/MusicPlayerContext";
import { FullScreenGradientBackground } from "@/components/GradientBackground";
import { Colors } from "@/constants/Colors";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

const gradientIndex = Math.floor(Math.random() * (19 + 1));

const FavoritesScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [formattedTracks, setFormattedTracks] = useState<Song[]>([]);
  const { top } = useSafeAreaInsets();
  const { playAudio, playPlaylist } = useMusicPlayer();
  const lastActiveTrack = useLastActiveTrack();
  const activeTrack = useActiveTrack();
  const router = useRouter();

  const favoritesTracks = useFavorites().favoriteTracks;

  const isFloatingPlayerNotVisible = !(activeTrack ?? lastActiveTrack);

  useEffect(() => {
    const fetchFavoriteTracks = async () => {
      setIsLoading(true);
      try {
        const tracks: Song[] = favoritesTracks;
        setFormattedTracks(tracks);
      } catch (error) {
        console.error("Error fetching favorite tracks", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteTracks();
  }, [favoritesTracks]);

  const handleSongSelect = (song: Song) => {
    playAudio(song);
  };

  return (
    <FullScreenGradientBackground index={gradientIndex}>
      <View style={[defaultStyles.container, { paddingTop: top }]}>
        {/* Header */}
        <Text style={styles.header}>Favorites</Text>

        {isScrolling && (
          <Divider
            style={{ backgroundColor: "rgba(255,255,255,0.3)", height: 0.3 }}
          />
        )}

        {/* Loading Indicator */}
        {isLoading ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <ScrollView
            style={styles.songList}
            contentContainerStyle={[
              styles.scrollContainer,
              formattedTracks.length === 0 && { flex: 1 },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              const currentScrollPosition =
                Math.floor(e.nativeEvent.contentOffset.y) || 0;
              setIsScrolling(currentScrollPosition > 0);
            }}
          >
            {formattedTracks.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: Colors.text,
                    textAlign: "center",
                    fontSize: 20,
                  }}
                >
                  No favorites yet! {"\n"}Start adding your favorite songs.
                </Text>
              </View>
            ) : (
              formattedTracks.map((item) => (
                <View key={item.id} style={styles.songItem}>
                  <TouchableOpacity
                    style={styles.songItemTouchableArea}
                    onPress={() => handleSongSelect(item)}
                  >
                    <FastImage
                      source={{ uri: item.thumbnail }}
                      style={styles.resultThumbnail}
                    />
                    {activeTrack?.id === item.id && (
                      <LoaderKit
                        style={styles.trackPlayingIconIndicator}
                        name="LineScalePulseOutRapid"
                        color={"white"}
                      />
                    )}
                    <View style={styles.resultText}>
                      <Text style={styles.resultTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.resultArtist} numberOfLines={1}>
                        {item.artist}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      // Convert the song object to a JSON string
                      const songData = JSON.stringify({
                        id: item.id,
                        title: item.title,
                        artist: item.artist,
                        thumbnail: item.thumbnail,
                      });

                      router.push({
                        pathname: "/(modals)/menu",
                        params: { songData: songData, type: "song" },
                      });
                    }}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Entypo
                      name="dots-three-vertical"
                      size={15}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              ))
            )}
            {formattedTracks.length !== 0 && (
              <Text
                style={{
                  color: Colors.textMuted,
                  textAlign: "center",
                  fontSize: 15,
                }}
              >
                {formattedTracks.length}{" "}
                {`Track${formattedTracks.length > 1 ? "s" : ""}`}
              </Text>
            )}
          </ScrollView>
        )}

        <FAB
          style={{
            position: "absolute",
            marginRight: 16,
            marginBottom: isFloatingPlayerNotVisible ? 16 : 90,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
          }}
          theme={{ roundness: 7 }}
          icon="play"
          color="black"
          onPress={async () => {
            if (formattedTracks.length === 0) return;
            await playPlaylist(formattedTracks);
            await router.navigate("/player");
          }}
        />
      </View>
    </FullScreenGradientBackground>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  scrollContainer: {
    paddingBottom: 145,
  },
  songList: {
    flexDirection: "column",
    width: "100%",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 30,
  },
  songItemTouchableArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultThumbnail: {
    width: 55,
    height: 55,
    marginRight: 10,
    borderRadius: 8,
  },
  trackPlayingIconIndicator: {
    position: "absolute",
    top: 17.5,
    left: 18.5,
    width: 20,
    height: 20,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    color: Colors.text,
    fontSize: 16,
  },
  resultArtist: {
    color: "#999",
    fontSize: 14,
  },
});
