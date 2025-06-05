import * as React from "react";
import { ToastAndroid } from "react-native";
import { Button, Dialog } from "react-native-paper";
import { Colors } from "@/constants/Colors";
import { usePlaylists } from "@/store/library";
import { useRouter, useLocalSearchParams } from "expo-router";

const DeletePlaylistDialog = () => {
  const { playlistName } = useLocalSearchParams<{ playlistName: string }>();
  const { deleteExistingPlaylist } = usePlaylists();
  const router = useRouter();

  async function deletePlaylist() {
    await deleteExistingPlaylist(playlistName);
    await ToastAndroid.show("Playlist deleted", ToastAndroid.SHORT);
    await router.back();
    if (await router.canDismiss()) await router.dismiss();
  }

  return (
    <Dialog
      visible={true}
      onDismiss={() => router.back()}
      style={{ backgroundColor: "#101010" }}
    >
      <Dialog.Title style={{ color: Colors.text }}>
        Delete this playlist?
      </Dialog.Title>
      <Dialog.Actions>
        <Button
          compact={true}
          textColor={Colors.text}
          onPress={() => router.back()}
        >
          Cancel
        </Button>
        <Button compact={true} textColor={"red"} onPress={deletePlaylist}>
          Delete
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default DeletePlaylistDialog;
