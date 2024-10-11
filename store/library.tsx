import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import * as FileSystem from "expo-file-system";

interface LibraryState {
  favoriteTracks: string[];
  playlists: Record<string, string[]>;
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
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const trackId = action.payload;
      const index = state.favoriteTracks.indexOf(trackId);
      if (index !== -1) {
        state.favoriteTracks.splice(index, 1);
      } else {
        state.favoriteTracks.push(trackId);
      }
      saveToFile(state); // Save to file after updating state
    },
    addToPlaylist: (
      state,
      action: PayloadAction<{ trackId: string; playlistName: string }>
    ) => {
      const { trackId, playlistName } = action.payload;
      if (!state.playlists[playlistName]) {
        state.playlists[playlistName] = [];
      }
      if (!state.playlists[playlistName].includes(trackId)) {
        state.playlists[playlistName].push(trackId);
      }
      saveToFile(state); // Save to file after updating state
    },
    setFavoriteTracks: (state, action: PayloadAction<string[]>) => {
      state.favoriteTracks = action.payload;
    },
    setPlaylists: (state, action: PayloadAction<Record<string, string[]>>) => {
      state.playlists = action.payload;
    },
  },
});

export const {
  toggleFavorite,
  addToPlaylist,
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

  const toggleFavoriteTrack = (trackId: string) => {
    dispatch(toggleFavorite(trackId));
  };

  return { favoriteTracks, toggleFavoriteTrack };
};

export const usePlaylists = () => {
  const playlists = useAppSelector((state) => state.library.playlists);
  const dispatch = useAppDispatch();

  const addTrackToPlaylist = (trackId: string, playlistName: string) => {
    dispatch(addToPlaylist({ trackId, playlistName }));
  };

  return { playlists, addTrackToPlaylist };
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
