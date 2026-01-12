import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useSubscriptionsQuery } from "../../src/services/subscriptions/queries";
import {
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from "../../src/services/theme";
import { useUserMeQuery } from "../../src/services/users/queries";

export default function Settings() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { logout } = useAuth();
  const { data: me } = useUserMeQuery();
  const { data: subscriptions = [] } = useSubscriptionsQuery();
  const activeSubscription = subscriptions[0];
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  const initials =
    me?.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "??";

  useEffect(() => {
    let isMounted = true;

    const loadPreference = async () => {
      const stored = await getThemePreference();
      if (stored && isMounted) {
        setThemePreferenceState(stored);
      }
    };

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
          Settings
        </Text>
        <Text className="mt-2 text-[14px] text-muted dark:text-muted-dark">
          Configure staff, devices, and preferences.
        </Text>

        <View className="mt-6 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-accent dark:bg-accent-dark">
              <Text className="text-[16px] font-semibold text-accent-ink dark:text-accent-ink-dark">
                {initials}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                {me?.name ?? "Loading..."}
              </Text>
              <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                {me?.role ?? "Role"}
              </Text>
              <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                {me?.email ?? ""}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
          <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
            Subscription
          </Text>
          <Text className="mt-3 text-[12px] text-muted dark:text-muted-dark">
            {activeSubscription?.plan_name ?? "Plan"}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[12px] text-muted dark:text-muted-dark">
              Joined
            </Text>
            <Text className="text-[12px] font-medium text-ink dark:text-ink-dark">
              {activeSubscription
                ? new Date(activeSubscription.joined_at).toLocaleDateString()
                : "--"}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[12px] text-muted dark:text-muted-dark">
              Expires
            </Text>
            <Text className="text-[12px] font-medium text-ink dark:text-ink-dark">
              {activeSubscription
                ? new Date(activeSubscription.expires_at).toLocaleDateString()
                : "--"}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-[12px] text-muted dark:text-muted-dark">
              Status
            </Text>
            <Text className="text-[12px] font-semibold text-accent-ink dark:text-accent-ink-dark">
              {activeSubscription?.status ?? "--"}
            </Text>
          </View>
        </View>

        <View className="mt-8 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
          <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">
            Theme
          </Text>
          <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
            Follow system or force a mode.
          </Text>
          <View className="mt-4 flex-row rounded-full border border-line bg-card p-1 dark:border-line-dark dark:bg-[#171A18]">
            {(["system", "light", "dark"] as const).map((mode) => {
              const isActive = themePreference === mode;
              return (
                <Pressable
                  key={mode}
                  className={`flex-1 rounded-full px-3 py-2 ${
                    isActive
                      ? "bg-primary dark:bg-primary-dark"
                      : "bg-transparent"
                  }`}
                  onPress={async () => {
                    setThemePreferenceState(mode);
                    setColorScheme(mode);
                    await setThemePreference(mode);
                  }}
                >
                  <Text
                    className={`text-center text-[12px] font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-muted dark:text-muted-dark"
                    }`}
                  >
                    {mode === "system"
                      ? "System"
                      : mode === "light"
                        ? "Light"
                        : "Dark"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-8 rounded-2xl border border-[#F1D4C2] bg-[#FFF4EC] px-4 py-4 dark:border-[#3A2A21] dark:bg-[#241B16]">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-semibold text-[#8B3A1A] dark:text-[#F2B397]">
                Log out
              </Text>
              <Text className="mt-1 text-[12px] text-[#8B3A1A] dark:text-[#D3A48D]">
                Sign out of this device.
              </Text>
            </View>
            <Pressable
              className="rounded-full bg-[#8B3A1A] px-4 py-2 dark:bg-[#F2B397]"
              onPress={logout}
            >
              <Text className="text-[12px] font-semibold text-[#FFF4EC] dark:text-[#241B16]">
                Log out
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
