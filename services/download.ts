import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import { store } from "@/store/library";
import { ToastAndroid } from "react-native";
import {
  addDownloadedTrack,
  removeDownloadedTrack,
  setSongDownloading,
  removeSongDownloading,
} from "@/store/library";
import { DownloadedSongMetadata } from "@/store/library";

// Interface for the song object
export interface RemoteSong {
  id: string;
  url: string;
  title: string;
  artist: string;
  duration?: number;
  thumbnailUrl?: string;
  mimeType?: string; // e.g., "audio/mp4", "audio/mpeg"
}

const ARTWORK_FOLDER = "Artworks"; // Folder name within documentDirectory

const makeSafeFilename = (name: string): string => {
  return (
    name
      // Replace characters that are illegal in Android filenames
      // Android illegal: / \ : * ? " < > | and control chars
      .replace(/[/\\?%*:|"<>]/g, "_")
      // Replace multiple spaces with a single underscore
      .replace(/\s+/g, "_")
      // Trim leading/trailing underscores
      .replace(/^_+|_+$/g, "")
      // Limit length to avoid issues, e.g. 200 chars for name part
      .substring(0, 200)
  );
};

/**
 * Attempts to determine a file extension from a URL or MIME type.
 * @param {string} url The URL of the content.
 * @param {string} [explicitMimeType] An explicitly provided MIME type.
 * @returns {string} A file extension (e.g., 'mp3', 'm4a').
 */
const getFileExtensionFromUrlOrMime = (
  url: string,
  explicitMimeType?: string,
): string => {
  let mimeType = explicitMimeType;

  if (!mimeType) {
    try {
      const urlObj = new URL(url);
      const mimeParam = urlObj.searchParams.get("mime");
      if (mimeParam) {
        mimeType = mimeParam;
      }
    } catch (e) {
      console.warn("Could not parse URL to find mime type:", e);
    }
  }

  if (mimeType) {
    if (mimeType.includes("audio/mp4") || mimeType.includes("audio/aac"))
      return "m4a";
    if (mimeType.includes("audio/mpeg")) return "mp3";
    if (mimeType.includes("audio/ogg")) return "ogg";
    if (mimeType.includes("audio/wav")) return "wav";
    if (mimeType.includes("audio/webm")) return "webm";
    // For images based on common types from URLs
    if (mimeType.includes("image/jpeg")) return "jpg";
    if (mimeType.includes("image/png")) return "png";
    if (mimeType.includes("image/webp")) return "webp";
  }

  try {
    const path = new URL(url).pathname;
    const lastDot = path.lastIndexOf(".");
    if (lastDot !== -1) {
      const ext = path.substring(lastDot + 1).toLowerCase();
      if (
        [
          "mp3",
          "m4a",
          "aac",
          "ogg",
          "wav",
          "webm",
          "jpg",
          "jpeg",
          "png",
          "webp",
        ].includes(ext)
      ) {
        return ext;
      }
    }
  } catch (e) {
    console.warn("Could not parse URL to find file extension:", e);
  }

  // Default based on typical content if still unknown
  if (url.includes("audio")) return "mp3"; // Generic audio fallback
  if (url.includes("image") || explicitMimeType?.includes("image"))
    return "jpg"; // Generic image fallback

  console.warn(
    `Could not determine specific file extension for URL: ${url} (MIME: ${
      mimeType || "unknown"
    }). Defaulting based on content or to 'dat'.`,
  );
  // If it's artwork and still unknown, default to jpg, otherwise to mp3 for audio
  return explicitMimeType?.startsWith("image/") ? "jpg" : "mp3";
};

const NOTIFICATION_CHANNEL_ID = "download_channel_audioscape";

/**
 * Sets up the notification channel for Android.
 * This should be called once when the app initializes.
 */
export async function setupNotificationChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: "Download Notifications",
    importance: Notifications.AndroidImportance.LOW, // Using LOW to avoid sound/vibration for progress
  });
  console.log("Notification channel for downloads set up.");
}

/**
 * Requests notification permissions from the user.
 */
export async function requestAppNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.warn("Notification permissions not granted.");
    return false;
  }
  return true;
}

export const requestDownloadPermissions = async (): Promise<boolean> => {
  console.log("Requesting media library permissions (for audio)...");

  // For MediaLibrary (saving audio)
  const mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();
  if (mediaLibraryPermissions.status !== "granted") {
    console.warn("Media library permission denied.");
    return false;
  }
  console.log("Media library permission granted.");
  return true;
};

export const downloadAndSaveSong = async (
  song: RemoteSong,
): Promise<DownloadedSongMetadata | null> => {
  const hasStoragePermissions = await requestDownloadPermissions();
  if (!hasStoragePermissions) {
    alert("Storage permissions are required to download songs and artwork.");
    return null;
  }

  const hasNotificationPermissions = await requestAppNotificationPermissions();

  const {
    id,
    url: remoteTrackUrl,
    title,
    artist,
    duration,
    thumbnailUrl: remoteArtworkUrl,
    mimeType: explicitMimeType,
  } = song;

  const existingDownload = getDownloadedSongMetadataById(id);
  if (existingDownload) {
    console.log(
      `Song "${title}" is already downloaded. Returning existing metadata.`,
    );
    return existingDownload;
  }

  ToastAndroid.show("Song download started", ToastAndroid.SHORT);

  const notificationId = `download_song_${id}`;

  const safeTitle = makeSafeFilename(title);
  const trackFileExtension = getFileExtensionFromUrlOrMime(
    remoteTrackUrl,
    explicitMimeType,
  );
  const artworkFileExtension = getFileExtensionFromUrlOrMime(
    remoteArtworkUrl || "",
    remoteArtworkUrl ? undefined : "image/jpeg",
  );

  const trackFileName = `${safeTitle}_${id}.${trackFileExtension}`;
  const artworkFileNameInDocs = `artwork_${safeTitle}_${id}.${artworkFileExtension}`;

  const tempTrackUriInCache = (FileSystem.cacheDirectory || "") + trackFileName;
  let tempArtworkUriInCache: string | undefined = remoteArtworkUrl
    ? (FileSystem.cacheDirectory || "") + `temp_${artworkFileNameInDocs}`
    : undefined;

  const finalArtworkUriInDocs = remoteArtworkUrl
    ? `${FileSystem.documentDirectory}${ARTWORK_FOLDER}/${artworkFileNameInDocs}`
    : undefined;

  if (hasNotificationPermissions) {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId,
      content: {
        title: `Downloading: ${title}`,
        body: "Starting download...",
        sticky: true,
        data: { songId: id },
      },
      trigger: { channelId: NOTIFICATION_CHANNEL_ID },
    }).catch((e) =>
      console.warn("Failed to schedule initial notification:", e),
    );
  }

  let lastNotifiedProgressPercent = -1; // Initialize to a value that will trigger the first update

  const downloadProgressCallback = (
    // This callback is synchronous
    downloadProgress: FileSystem.DownloadProgressData,
  ) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    const progressPercent = Math.round(progress * 100);

    // Only log and attempt to update notification if the percentage has changed
    if (progressPercent > lastNotifiedProgressPercent) {
      lastNotifiedProgressPercent = progressPercent;

      store.dispatch(
        setSongDownloading({
          song: {
            id: song.id,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnailUrl ?? "https://placehold.co/50",
          },
          progress: progressPercent,
        }),
      );

      if (hasNotificationPermissions) {
        // Fire-and-forget the async notification update
        (async () => {
          try {
            await Notifications.scheduleNotificationAsync({
              identifier: notificationId,
              content: {
                title: `Downloading: ${title}`,
                body: `Progress: ${progressPercent}%`,
                sticky: true,
              },
              trigger: { channelId: NOTIFICATION_CHANNEL_ID },
            });
          } catch (e) {
            console.warn("Failed to update progress notification:", e);
          }
        })();
      }
    }
  };

  try {
    console.log(`Starting audio download for: ${title} (as ${trackFileName})`);

    const trackDownloadResumable = FileSystem.createDownloadResumable(
      remoteTrackUrl,
      tempTrackUriInCache,
      {},
      downloadProgressCallback, // Pass the synchronous callback
    );
    const trackDownloadResult = await trackDownloadResumable.downloadAsync();

    if (!trackDownloadResult || trackDownloadResult.status !== 200) {
      console.error("Failed to download track:", trackDownloadResult);
      if (trackDownloadResult?.uri)
        await FileSystem.deleteAsync(trackDownloadResult.uri, {
          idempotent: true,
        });
      throw new Error(
        `Failed to download track: ${title}. Status: ${trackDownloadResult?.status}`,
      );
    }
    console.log(
      "Track downloaded to temporary cache location:",
      trackDownloadResult.uri,
    );

    let storedArtworkPath: string | undefined = undefined;

    if (remoteArtworkUrl && tempArtworkUriInCache && finalArtworkUriInDocs) {
      console.log(`Starting artwork download for: ${title}`);
      const artworkDownloadResumable = FileSystem.createDownloadResumable(
        remoteArtworkUrl,
        tempArtworkUriInCache,
        {},
      );
      const artworkDownloadResult =
        await artworkDownloadResumable.downloadAsync();

      if (artworkDownloadResult && artworkDownloadResult.status === 200) {
        console.log(
          "Artwork downloaded to temporary cache location:",
          artworkDownloadResult.uri,
        );
        const artworkDir = `${FileSystem.documentDirectory}${ARTWORK_FOLDER}`;
        const dirInfo = await FileSystem.getInfoAsync(artworkDir);
        if (!dirInfo.exists) {
          console.log(`Creating artwork directory: ${artworkDir}`);
          await FileSystem.makeDirectoryAsync(artworkDir, {
            intermediates: true,
          });
        }
        await FileSystem.moveAsync({
          from: artworkDownloadResult.uri,
          to: finalArtworkUriInDocs,
        });
        storedArtworkPath = finalArtworkUriInDocs;
        console.log("Artwork saved to document directory:", storedArtworkPath);
      } else {
        console.warn(
          "Failed to download artwork. Result:",
          artworkDownloadResult,
        );
        if (artworkDownloadResult?.uri) {
          await FileSystem.deleteAsync(artworkDownloadResult.uri, {
            idempotent: true,
          });
        }
      }
    }

    const trackAsset = await MediaLibrary.createAssetAsync(
      trackDownloadResult.uri,
    );
    console.log(
      "Track asset created in MediaLibrary:",
      trackAsset.uri,
      "ID:",
      trackAsset.id,
    );

    console.log(`Deleting cached track file: ${trackDownloadResult.uri}`);
    await FileSystem.deleteAsync(trackDownloadResult.uri, { idempotent: true });

    const metadata: DownloadedSongMetadata = {
      id,
      title,
      artist,
      duration,
      localTrackUri: trackAsset.uri,
      mediaLibraryAssetId: trackAsset.id,
      localArtworkUri: storedArtworkPath,
      downloadDate: new Date().toISOString(),
    };

    if (hasNotificationPermissions) {
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: "Download Complete",
          body: `${title} has been successfully downloaded.`,
          sticky: false,
        },
        trigger: { channelId: NOTIFICATION_CHANNEL_ID },
      }).catch((e) =>
        console.warn("Failed to schedule completion notification:", e),
      );
    }

    store.dispatch(addDownloadedTrack(metadata));
    console.log(
      `Successfully processed: ${title}. Metadata dispatched to Redux.`,
    );
    return metadata;
  } catch (error) {
    console.error(`Error during download and save for song ${title}:`, error);

    if (hasNotificationPermissions) {
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: "Download Failed",
          body: `Could not download ${title}.`,
          sticky: false,
        },
        trigger: { channelId: NOTIFICATION_CHANNEL_ID },
      }).catch((e) =>
        console.warn("Failed to schedule error notification:", e),
      );
    }

    await FileSystem.deleteAsync(tempTrackUriInCache, {
      idempotent: true,
    }).catch((e) => console.warn("Cleanup error for temp track in cache:", e));
    if (tempArtworkUriInCache) {
      const tempArtworkInfo = await FileSystem.getInfoAsync(
        tempArtworkUriInCache,
      ).catch(() => ({ exists: false }));
      if (tempArtworkInfo.exists) {
        await FileSystem.deleteAsync(tempArtworkUriInCache, {
          idempotent: true,
        }).catch((e) =>
          console.warn("Cleanup error for temp artwork in cache:", e),
        );
      }
    }

    alert(`Failed to download ${title}`);
    return null;
  } finally {
    store.dispatch(removeSongDownloading(id));
  }
};

export const getAllDownloadedSongsMetadata = (): DownloadedSongMetadata[] => {
  const state = store.getState();
  return state.library?.downloadedTracks || [];
};

export const getDownloadedSongMetadataById = (
  songId: string,
): DownloadedSongMetadata | undefined => {
  const downloadedSongs = getAllDownloadedSongsMetadata();
  return downloadedSongs.find((s) => s.id === songId);
};

export const removeDownloadedSong = async (
  songId: string,
): Promise<boolean> => {
  try {
    const mediaLibraryPermissions = await MediaLibrary.getPermissionsAsync();
    if (mediaLibraryPermissions.status !== "granted") {
      const requestedPermissions = await MediaLibrary.requestPermissionsAsync();
      if (requestedPermissions.status !== "granted") {
        console.warn(
          "MediaLibrary permissions not granted, cannot delete audio asset from MediaLibrary.",
        );
      }
    }

    const songToRemove = getDownloadedSongMetadataById(songId);
    if (!songToRemove) {
      console.log("Song not found in Redux metadata, cannot remove:", songId);
      return true;
    }

    if (songToRemove.localArtworkUri) {
      console.log("Deleting local artwork:", songToRemove.localArtworkUri);
      await FileSystem.deleteAsync(songToRemove.localArtworkUri, {
        idempotent: true,
      }).catch((e) => {
        console.warn(
          `Failed to delete local artwork ${songToRemove.localArtworkUri}:`,
          e,
        );
      });
    }

    const assetsToDeleteFromMediaLibrary: string[] = [];
    if (songToRemove.mediaLibraryAssetId) {
      assetsToDeleteFromMediaLibrary.push(songToRemove.mediaLibraryAssetId);
    }

    if (
      assetsToDeleteFromMediaLibrary.length > 0 &&
      mediaLibraryPermissions.status === "granted"
    ) {
      console.log(
        "Deleting assets from MediaLibrary:",
        assetsToDeleteFromMediaLibrary,
      );
      try {
        const deletionResult = await MediaLibrary.deleteAssetsAsync(
          assetsToDeleteFromMediaLibrary,
        );
        if (deletionResult) {
          console.log(
            "MediaLibrary.deleteAssetsAsync call potentially successful for song:",
            songId,
          );
        } else {
          console.warn(
            "MediaLibrary.deleteAssetsAsync call reported failure for song:",
            songId,
          );
        }
      } catch (mediaError) {
        console.error("Error deleting assets from MediaLibrary:", mediaError);
      }
    } else if (assetsToDeleteFromMediaLibrary.length > 0) {
      console.warn(
        "Skipping MediaLibrary asset deletion due to missing permissions.",
      );
    }

    store.dispatch(removeDownloadedTrack(songId));
    console.log("Dispatched removeDownloadedTrack for song:", songId);
    return true;
  } catch (e) {
    console.error(`Failed to remove downloaded song ${songId}:`, e);
    alert(String(e));
    return false;
  }
};

export const isSongDownloaded = (id: string): boolean => {
  const state = store.getState();
  return state.library.downloadedTracks.some((track) => track.id === id);
};
