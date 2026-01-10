import { useColorScheme } from "nativewind";
import { Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useUserMeQuery } from "../services/users/queries";

export default function Settings() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { logout } = useAuth();
  const { data: me } = useUserMeQuery();

  const initials =
    me?.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "??";

  return (
    <SafeAreaView className="flex-1 bg-[#FBF7F0] dark:bg-[#0F1110]">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-[22px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
          Settings
        </Text>
        <Text className="mt-2 text-[14px] text-[#6B6257] dark:text-[#A79B8B]">
          Configure staff, devices, and preferences.
        </Text>

        <View className="mt-6 rounded-2xl border border-[#E3D7C7] bg-white px-4 py-4 dark:border-[#2B2F2C] dark:bg-[#1F2321]">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E4F1EC] dark:bg-[#1F2E2A]">
              <Text className="text-[16px] font-semibold text-[#1F6C55] dark:text-[#8DDAC6]">
                {initials}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-[15px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
                {me?.name ?? "Loading..."}
              </Text>
              <Text className="mt-1 text-[12px] text-[#6B6257] dark:text-[#A79B8B]">
                {me?.role ?? "Role"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-8 rounded-2xl border border-[#E3D7C7] bg-white px-4 py-4 dark:border-[#2B2F2C] dark:bg-[#1F2321]">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[15px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
                Dark mode
              </Text>
              <Text className="mt-1 text-[12px] text-[#6B6257] dark:text-[#A79B8B]">
                Toggle the app theme.
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(value) => setColorScheme(value ? "dark" : "light")}
              trackColor={{ false: "#E3D7C7", true: "#2C8C7A" }}
              thumbColor={isDark ? "#F5F1EA" : "#FFFFFF"}
            />
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
