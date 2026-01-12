import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useColorScheme } from "nativewind";
import SplashScreen from "../components/SplashScreen";
import { useAuth } from "../src/context/AuthContext";
import { colors } from "../src/theme/colors";

export default function Index() {
  const { user, isInitializing } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [canRedirect, setCanRedirect] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isInitializing || canRedirect) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(() => setCanRedirect(true));
  }, [canRedirect, isInitializing, opacity, scale]);

  if (isInitializing || !canRedirect) {
    return (
      <Animated.View
        style={{
          flex: 1,
          opacity,
          transform: [{ scale }],
          backgroundColor: isDark ? colors.baseDark : colors.base,
        }}
        pointerEvents="none"
      >
        <SplashScreen />
      </Animated.View>
    );
  }

  return <Redirect href={user ? "/dashboard" : "/login"} />;
}
