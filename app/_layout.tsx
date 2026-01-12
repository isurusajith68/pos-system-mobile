import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { getThemePreference, setThemePreference } from "../src/services/theme";
import { colors } from "../src/theme/colors";
import "./global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const { setColorScheme, colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: colors.baseDark },
      }
    : {
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colors.base },
      };

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async () => {
      const stored = await getThemePreference();
      const preference = stored ?? "system";
      if (isMounted) {
        setColorScheme(preference);
      }
      if (!stored) {
        await setThemePreference(preference);
      }
    };

    loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, [setColorScheme]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider value={navigationTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                animationDuration: 220,
                animationTypeForReplace: "push",
                contentStyle: {
                  backgroundColor: isDark ? colors.baseDark : colors.base,
                },
              }}
            >
              <Stack.Screen name="index" options={{ animation: "fade" }} />
              <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
              <Stack.Screen name="(app)" options={{ animation: "fade" }} />
            </Stack>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
