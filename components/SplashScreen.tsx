import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 420,
            useNativeDriver: true,
          }),
        ])
      );

    const animation = Animated.parallel([
      createPulse(dot1, 0),
      createPulse(dot2, 120),
      createPulse(dot3, 240),
    ]);

    animation.start();
    return () => animation.stop();
  }, [dot1, dot2, dot3]);

  return (
    <SafeAreaView className="flex-1 bg-[#0B6A63]">
      <View className="flex-1">
        <View className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#2A8C83]" />
        <View className="absolute -left-24 -bottom-24 h-60 w-60 rounded-full bg-[#2C6E66]" />

        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-[#3A8E86]">
            <Text className="text-[28px] font-semibold text-white">Z</Text>
          </View>
          <Text className="mt-6 text-[24px] font-semibold text-white">
            Zentra POS
          </Text>
          <Text className="mt-2 text-[13px] text-[#CFE8E5]">
            Point of Sale System
          </Text>

          <View className="mt-6 flex-row items-center">
            <Animated.View
              className="mx-1 h-2 w-2 rounded-full bg-[#CFE8E5]"
              style={{ opacity: dot1, transform: [{ scale: dot1 }] }}
            />
            <Animated.View
              className="mx-1 h-2 w-2 rounded-full bg-[#9BC8C3]"
              style={{ opacity: dot2, transform: [{ scale: dot2 }] }}
            />
            <Animated.View
              className="mx-1 h-2 w-2 rounded-full bg-[#6FAFA7]"
              style={{ opacity: dot3, transform: [{ scale: dot3 }] }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
