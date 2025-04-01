import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  useTrackPlayerEvents,
  Event,
  useActiveTrack,
} from "react-native-track-player";
import { Client, Query } from "lrclib-api";

// Create a client instance
const client = new Client();

// Define types
type LyricLine = {
  text: string;
  startTime?: number;
};

type LyricsContextType = {
  lyrics: LyricLine[];
  isLyricsLoaded: boolean;
  heights: number[];
  updateHeight: (index: number, height: number) => void;
  resetHeights: (length: number) => void;
};

// Create context
const LyricsContext = createContext<LyricsContextType | undefined>(undefined);

// Provider component
export const LyricsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLyricsLoaded, setIsLyricsLoaded] = useState(false);
  const [heights, setHeights] = useState<number[]>([]);
  const [lastLoadedTrackId, setLastLoadedTrackId] = useState<string | null>(
    null
  );

  const activeTrack = useActiveTrack();

  const fetchLyrics = useCallback(async () => {
    if (!activeTrack) return;

    // Skip fetching if we've already loaded lyrics for this track
    if (lastLoadedTrackId === activeTrack.id) {
      return;
    }

    // Update the last loaded track ID
    setLastLoadedTrackId(activeTrack.id);

    // Reset loading state
    setIsLyricsLoaded(false);

    try {
      if (activeTrack.title && activeTrack.artist) {
        const searchParams: Query = {
          track_name: activeTrack.title,
          artist_name: activeTrack.artist,
        };

        // Add duration only if it's defined
        if (activeTrack.duration !== undefined) {
          searchParams.duration = activeTrack.duration * 1000;
        }

        const syncedLyrics = await client.getSynced(searchParams);

        // Make sure we have valid lyrics with startTime
        if (syncedLyrics && syncedLyrics.length > 0) {
          // Sort lyrics by startTime to ensure proper ordering
          const sortedLyrics = [...syncedLyrics].sort(
            (a, b) => (a.startTime || 0) - (b.startTime || 0)
          );

          setLyrics(sortedLyrics);
          // Reset heights array to match lyrics length
          setHeights(new Array(sortedLyrics.length).fill(0));
          setIsLyricsLoaded(true);
        } else {
          // Set a fallback for tracks without lyrics
          const fallbackLyrics = [
            { text: "No lyrics available", startTime: 0 },
          ];
          setLyrics(fallbackLyrics);
          setHeights([0]);
          setIsLyricsLoaded(true);
        }
      }
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      const fallbackLyrics = [{ text: "Error loading lyrics", startTime: 0 }];
      setLyrics(fallbackLyrics);
      setHeights([0]);
      setIsLyricsLoaded(true);
    }
  }, [activeTrack, lastLoadedTrackId]);

  // Function to update a specific height
  const updateHeight = useCallback((index: number, height: number) => {
    setHeights((prevHeights) => {
      const newHeights = [...prevHeights];
      newHeights[index] = height;
      return newHeights;
    });
  }, []);

  // Function to reset heights array
  const resetHeights = useCallback((length: number) => {
    setHeights(new Array(length).fill(0));
  }, []);

  // Fetch lyrics when active track changes
  useEffect(() => {
    if (activeTrack?.id && activeTrack.id !== lastLoadedTrackId) {
      fetchLyrics();
    }
  }, [activeTrack?.id, fetchLyrics, lastLoadedTrackId]);

  // Register for track change events
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged && event.track) {
      if (event.track.id !== lastLoadedTrackId) {
        await fetchLyrics();
      }
    }
  });

  const contextValue: LyricsContextType = {
    lyrics,
    isLyricsLoaded,
    heights,
    updateHeight,
    resetHeights,
  };

  return (
    <LyricsContext.Provider value={contextValue}>
      {children}
    </LyricsContext.Provider>
  );
};

// Hook to use the lyrics context
export const useLyricsContext = () => {
  const context = useContext(LyricsContext);
  if (context === undefined) {
    throw new Error("useLyricsContext must be used within a LyricsProvider");
  }
  return context;
};
