import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedTabBarButton({
  accessibilityState,
  onPress,
  onLongPress,
  children,
  style,
  ...rest
}: BottomTabBarButtonProps) {
  const isSelected = accessibilityState?.selected ?? false;
  const scale = useRef(new Animated.Value(isSelected ? 1 : 0.96)).current;
  const opacity = useRef(new Animated.Value(isSelected ? 1 : 0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: isSelected ? 1 : 0.96,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: isSelected ? 1 : 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSelected, opacity, scale]);

  return (
    <AnimatedPressable
      {...rest}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[style, { transform: [{ scale }], opacity }]}
    >
      {children}
    </AnimatedPressable>
  );
}
