import { useFavorites } from "@/store/library";
import { useCallback, useEffect, useState } from "react";
import TrackPlayer, { useActiveTrack } from "react-native-track-player";

export const useTrackPlayerFavorite = () => {
  const activeTrack = useActiveTrack();
  const { favoriteTracks, toggleFavoriteTrack } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (activeTrack) {
      setIsFavorite(
        favoriteTracks.some((track) => track.id === activeTrack.id)
      );
    }
  }, [activeTrack, favoriteTracks]);

  const toggleFavoriteFunc = useCallback(async () => {
    if (!activeTrack) return;

    // Toggle favorite status
    toggleFavoriteTrack({
      id: activeTrack.id,
      title: activeTrack.title || "",
      artist: activeTrack.artist || "",
      thumbnail: activeTrack.artwork || "",
    });

    // Update track player internal state
    try {
      const queue = await TrackPlayer.getQueue();
      const trackIndex = queue.findIndex(
        (track) => track.id === activeTrack.id
      );

      if (trackIndex !== -1) {
        await TrackPlayer.updateMetadataForTrack(trackIndex, {
          rating: isFavorite ? 0 : 1,
        });
      }
    } catch (error) {
      console.error("Error updating track metadata:", error);
    }
  }, [activeTrack, isFavorite, toggleFavoriteTrack]);

  return { isFavorite, toggleFavoriteFunc };
};
