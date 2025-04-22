import { fontSize } from "@/constants/tokens";
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: fontSize.base,
    color: Colors.text,
  },
});
