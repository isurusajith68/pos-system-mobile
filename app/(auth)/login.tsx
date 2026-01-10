import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    setFormError(null);
    try {
      await login({ email: email.trim(), password: password.trim() });
      router.replace("/dashboard");
    } catch {
      // Error is handled by context state.
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBF7F0] dark:bg-[#0F1110]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6 rounded-[28px] bg-[#F2EFE6] p-6 overflow-hidden dark:bg-[#1A1B1A]">
          <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#F4D79B] dark:bg-[#5B4A1D]" />
          <View className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-[#DDE7E3] dark:bg-[#1F2E2A]" />
          <View className="self-start rounded-full bg-[#111827] px-4 py-1.5 dark:bg-[#F5F1EA]">
            <Text className="text-xs font-semibold tracking-wide text-[#F4F1EA] dark:text-[#1E1B16]">
              Zentra POS
            </Text>
          </View>
          <Text className="mt-5 text-[26px] font-semibold leading-8 text-[#1E1B16] dark:text-[#F5F1EA]">
            Fresh start for your{"\n"}store
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-[#6B6257] dark:text-[#A79B8B]">
            Sign in to sync sales, inventory, and daily reports.
          </Text>
        </View>

        <View className="mt-8">
          <Text className="text-sm font-medium text-[#6B6257] dark:text-[#A79B8B]">
            Email
          </Text>
          <TextInput
            className="mt-2 rounded-2xl border border-[#E3D7C7] bg-white px-4 py-3 text-[15px] text-[#1E1B16] dark:border-[#2B2F2C] dark:bg-[#1F2321] dark:text-[#F5F1EA]"
            placeholder="demo@zentra.com"
            placeholderTextColor="#A79B8B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mt-5">
          <Text className="text-sm font-medium text-[#6B6257] dark:text-[#A79B8B]">
            Password
          </Text>
          <TextInput
            className="mt-2 rounded-2xl border border-[#E3D7C7] bg-white px-4 py-3 text-[15px] text-[#1E1B16] dark:border-[#2B2F2C] dark:bg-[#1F2321] dark:text-[#F5F1EA]"
            placeholder="********"
            placeholderTextColor="#A79B8B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[13px] text-[#6B6257] dark:text-[#A79B8B]">
              Forgot password?
            </Text>
            <Pressable className="rounded-full bg-[#E4F1EC] px-3 py-1 dark:bg-[#1F2E2A]">
              <Text className="text-xs font-semibold text-[#1F6C55] dark:text-[#8DDAC6]">
                Reset
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className="mt-6 rounded-2xl bg-[#0E6B5B] py-4 shadow-lg dark:bg-[#2C8C7A]"
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text className="text-center text-[16px] font-semibold text-white">
            {isLoading ? "Signing in..." : "Sign in"}
          </Text>
        </Pressable>

        {(formError || error) && (
          <View className="mt-4 rounded-2xl border border-[#F1C9C9] bg-[#FCEAEA] px-4 py-3 dark:border-[#4A2C2C] dark:bg-[#2B1B1B]">
            <Text className="text-[13px] text-[#9B2C2C] dark:text-[#F29B9B]">
              {formError ?? error}
            </Text>
          </View>
        )}

        <View className="mt-4">
          <Text className="text-[13px] text-[#6B6257] dark:text-[#A79B8B]">
            Last sync 2 minutes ago
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
