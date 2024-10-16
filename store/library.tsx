import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import * as FileSystem from "expo-file-system";

interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface LibraryState {
  favoriteTracks: TrackInfo[];
  playlists: Record<string, TrackInfo[]>;
}

const initialState: LibraryState = {
  favoriteTracks: [],
  playlists: {},
};

// Path to store the data file
const dataFilePath = `${FileSystem.documentDirectory}libraryData.json`;

const saveToFile = async (data: LibraryState) => {
  try {
    const jsonData = JSON.stringify(data);
    await FileSystem.writeAsStringAsync(dataFilePath, jsonData);
  } catch (error) {
    console.error("Failed to save data:", error);
  }
};

// Check if the file exists, and if not, create it with initial state
const ensureFileExists = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(dataFilePath);
    if (!fileInfo.exists) {
      // Create file with initial state if it doesn't exist
      await saveToFile(initialState);
    }
  } catch (error) {
    console.error("Failed to ensure file existence:", error);
  }
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<TrackInfo>) => {
      const trackInfo = action.payload;
      const index = state.favoriteTracks.findIndex(
        (track) => track.id === trackInfo.id
      );
      if (index !== -1) {
        state.favoriteTracks.splice(index, 1);
      } else {
        state.favoriteTracks.push(trackInfo);
      }
      saveToFile(state); // Save to file after updating state
    },
    addToPlaylist: (
      state,
      action: PayloadAction<{ track: TrackInfo; playlistName: string }>
    ) => {
      const { track, playlistName } = action.payload;
      if (!state.playlists[playlistName]) {
        state.playlists[playlistName] = [];
      }
      if (!state.playlists[playlistName].some((t) => t.id === track.id)) {
        state.playlists[playlistName].push(track);
      }
      saveToFile(state); // Save to file after updating state
    },
    removeFromPlaylist: (
      state,
      action: PayloadAction<{ trackId: string; playlistName: string }>
    ) => {
      const { trackId, playlistName } = action.payload;
      if (state.playlists[playlistName]) {
        state.playlists[playlistName] = state.playlists[playlistName].filter(
          (track) => track.id !== trackId
        );
        saveToFile(state); // Save to file after updating state
      }
    },
    createPlaylist: (
      state,
      action: PayloadAction<{ playlistName: string; tracks?: TrackInfo[] }>
    ) => {
      const { playlistName, tracks = [] } = action.payload;
      if (!state.playlists[playlistName]) {
        state.playlists[playlistName] = tracks;
        saveToFile(state); // Save to file after updating state
      }
    },
    deletePlaylist: (state, action: PayloadAction<string>) => {
      const playlistName = action.payload;
      if (state.playlists[playlistName]) {
        delete state.playlists[playlistName];
        saveToFile(state); // Save to file after updating state
      }
    },
    setFavoriteTracks: (state, action: PayloadAction<TrackInfo[]>) => {
      state.favoriteTracks = action.payload;
    },
    setPlaylists: (
      state,
      action: PayloadAction<Record<string, TrackInfo[]>>
    ) => {
      state.playlists = action.payload;
    },
  },
});

export const {
  toggleFavorite,
  addToPlaylist,
  removeFromPlaylist,
  createPlaylist,
  deletePlaylist,
  setFavoriteTracks,
  setPlaylists,
} = librarySlice.actions;
const libraryReducer = librarySlice.reducer;

const store = configureStore({
  reducer: {
    library: libraryReducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

const useAppDispatch: () => AppDispatch = useDispatch;
const useAppSelector: <T>(selector: (state: RootState) => T) => T = useSelector;

export const useFavorites = () => {
  const favoriteTracks = useAppSelector(
    (state) => state.library.favoriteTracks
  );
  const dispatch = useAppDispatch();

  const toggleFavoriteTrack = (trackInfo: TrackInfo) => {
    dispatch(toggleFavorite(trackInfo));
  };

  return { favoriteTracks, toggleFavoriteTrack };
};

export const usePlaylists = () => {
  const playlists = useAppSelector((state) => state.library.playlists);
  const dispatch = useAppDispatch();

  const addTrackToPlaylist = (track: TrackInfo, playlistName: string) => {
    dispatch(addToPlaylist({ track, playlistName }));
  };

  const removeTrackFromPlaylist = (trackId: string, playlistName: string) => {
    dispatch(removeFromPlaylist({ trackId, playlistName }));
  };

  const createNewPlaylist = (playlistName: string, tracks?: TrackInfo[]) => {
    dispatch(createPlaylist({ playlistName, tracks }));
  };

  const deleteExistingPlaylist = (playlistName: string) => {
    dispatch(deletePlaylist(playlistName));
  };

  return {
    playlists,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    createNewPlaylist,
    deleteExistingPlaylist,
  };
};

// Load data from file system
const loadStoredData = async (dispatch: AppDispatch) => {
  try {
    const storedData = await FileSystem.readAsStringAsync(dataFilePath);
    const parsedData: LibraryState = JSON.parse(storedData);

    dispatch(setFavoriteTracks(parsedData.favoriteTracks));
    dispatch(setPlaylists(parsedData.playlists));
  } catch (error) {
    console.error("Failed to load stored data:", error);
  }
};

export const initializeLibrary = async () => {
  await ensureFileExists(); // Ensure the file exists before loading data
  loadStoredData(store.dispatch);
};

export { store };
