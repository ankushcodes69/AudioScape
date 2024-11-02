import React, { ReactNode } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const { height } = Dimensions.get("window");

interface SwipeToDismissPlayerProps {
  children: ReactNode;
}

const SwipeToDismissPlayer: React.FC<SwipeToDismissPlayerProps> = ({
  children,
}) => {
  const translateY = useSharedValue(0);
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > height * 0.1) {
        translateY.value = withTiming(
          height + 100,
          {
            duration: 1000,
            easing: Easing.out(Easing.exp),
          },
          () => {
            runOnJS(goBack)();
          }
        );
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SwipeToDismissPlayer;
