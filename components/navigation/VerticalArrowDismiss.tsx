import React, { ReactNode } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const { height } = Dimensions.get("window");

interface VerticalDismissProps {
  children: (handleDismiss: () => void) => ReactNode;
}

const VerticalDismiss: React.FC<VerticalDismissProps> = ({ children }) => {
  const translateY = useSharedValue(0);
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const handleDismiss = () => {
    translateY.value = withTiming(
      height + 100,
      {
        duration: 2000,
        easing: Easing.out(Easing.exp),
      },
      () => {
        runOnJS(goBack)();
      }
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children(handleDismiss)}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default VerticalDismiss;
