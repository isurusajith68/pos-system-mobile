import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useColorScheme } from "nativewind";

type SkeletonBlockProps = {
  width?: number | string;
  height: number;
  className?: string;
  radius?: number;
};

export function SkeletonBlock({
  width,
  height,
  className,
  radius = 999,
}: SkeletonBlockProps) {
  const { colorScheme } = useColorScheme();
  const opacity = useRef(new Animated.Value(0.45)).current;
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={{
        width,
        height,
        opacity,
        borderRadius: radius,
        backgroundColor: isDark ? "#242726" : "#E7DED1",
      }}
    />
  );
}
