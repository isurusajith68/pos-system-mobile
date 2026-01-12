import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "preferences.theme";

export async function getThemePreference(): Promise<ThemePreference | null> {
  const stored = await SecureStore.getItemAsync(THEME_KEY);
  if (stored === "system" || stored === "light" || stored === "dark") {
    return stored;
  }

  return null;
}

export async function setThemePreference(value: ThemePreference) {
  await SecureStore.setItemAsync(THEME_KEY, value);
}
