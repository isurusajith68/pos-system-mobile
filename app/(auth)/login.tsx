import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FBF7F0]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 rounded-[28px] bg-[#F2EFE6] p-6 overflow-hidden">
          <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#F4D79B]" />
          <View className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-[#DDE7E3]" />
          <View className="self-start rounded-full bg-[#111827] px-4 py-1.5">
            <Text className="text-xs font-semibold tracking-wide text-[#F4F1EA]">
              Zentra POS
            </Text>
          </View>
          <Text className="mt-5 text-[26px] font-semibold leading-8 text-[#1E1B16]">
            Fresh start for your{"\n"}store
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-[#6B6257]">
            Sign in to sync sales, inventory, and daily reports.
          </Text>
        </View>

        <View className="mt-8">
          <Text className="text-sm font-medium text-[#6B6257]">Email</Text>
          <TextInput
            className="mt-2 rounded-2xl border border-[#E3D7C7] bg-white px-4 py-3 text-[15px] text-[#1E1B16]"
            placeholder="demo@zentra.com"
            placeholderTextColor="#A79B8B"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mt-5">
          <Text className="text-sm font-medium text-[#6B6257]">Password</Text>
          <TextInput
            className="mt-2 rounded-2xl border border-[#E3D7C7] bg-white px-4 py-3 text-[15px] text-[#1E1B16]"
            placeholder="********"
            placeholderTextColor="#A79B8B"
            secureTextEntry
          />
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[13px] text-[#6B6257]">Forgot password?</Text>
            <Pressable className="rounded-full bg-[#E4F1EC] px-3 py-1">
              <Text className="text-xs font-semibold text-[#1F6C55]">
                Reset
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className="mt-6 rounded-2xl bg-[#0E6B5B] py-4 shadow-lg"
          onPress={() => router.push("/dashboard")}
        >
          <Text className="text-center text-[16px] font-semibold text-white">
            Sign in
          </Text>
        </Pressable>

        <View className="mt-4">
          <Text className="text-[13px] text-[#6B6257]">
            Last sync 2 minutes ago
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
