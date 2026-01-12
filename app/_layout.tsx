import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/context/AuthContext";
import { getThemePreference, setThemePreference } from "../src/services/theme";
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
  const { setColorScheme } = useColorScheme();

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
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
