import unknownTrackImage from "@/assets/images/unknown_track.png";
import transparentIconImage from "@/assets/images/transparent-icon.png";
import { Image } from "react-native";

export const unknownTrackImageUri =
  Image.resolveAssetSource(unknownTrackImage).uri;
export const transparentIconUri =
  Image.resolveAssetSource(transparentIconImage).uri;
