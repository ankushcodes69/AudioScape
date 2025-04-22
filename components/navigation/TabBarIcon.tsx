import Ionicons from "@expo/vector-icons/Ionicons";
import { type IconProps } from "@expo/vector-icons/build/createIconSet";
import { type ComponentProps } from "react";
import { moderateScale } from "react-native-size-matters/extend";

export function TabBarIcon({
  style,
  ...rest
}: IconProps<ComponentProps<typeof Ionicons>["name"]>) {
  return (
    <Ionicons
      size={moderateScale(25)}
      style={[{ marginBottom: -3 }, style]}
      {...rest}
    />
  );
}
