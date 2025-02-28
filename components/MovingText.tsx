import { Text, TextStyle, StyleProp } from "react-native";
import { Marquee } from "@animatereactnative/marquee";

export type MovingTextProps = {
  text: string;
  animationThreshold: number;
  style: StyleProp<TextStyle>;
};

export const MovingText = ({
  text,
  animationThreshold,
  style,
}: MovingTextProps) => {
  const shouldAnimate = text.length >= animationThreshold;

  if (shouldAnimate) {
    return (
      <Marquee spacing={60} speed={0.3} withGesture={false}>
        <Text numberOfLines={1} style={style}>
          {text}
        </Text>
      </Marquee>
    );
  } else {
    return (
      <Text numberOfLines={1} style={style}>
        {text}
      </Text>
    );
  }
};
