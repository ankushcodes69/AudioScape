import React, { ReactNode } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
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
  duration?: number;
}

const SwipeToDismissPlayer: React.FC<SwipeToDismissPlayerProps> = ({
  children,
  duration = 1000,
}) => {
  const translateY = useSharedValue(0);
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const gestureHandler = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > height * 0.1) {
        translateY.value = withTiming(
          height + 100,
          {
            duration: duration,
            easing: Easing.out(Easing.exp),
          },
          () => {
            runOnJS(goBack)();
          }
        );
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SwipeToDismissPlayer;
