import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { getApiErrorMessage } from "../../src/services/api";

export default function Index() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("test2@gmail.com");
  const [password, setPassword] = useState("123456");
  const [formError, setFormError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFormError("Email and password are required.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setFormError(null);
    try {
      await login({ email: trimmedEmail, password: trimmedPassword });
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
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
          <Text className="mt-5 text-[26px] font-semibold leading-8 text-ink dark:text-ink-dark">
            Fresh start for your{"\n"}store
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-muted dark:text-muted-dark">
            Sign in to sync sales, inventory, and daily reports.
          </Text>
        </View>

        <View className="mt-8">
          <Text className="text-sm font-medium text-muted dark:text-muted-dark">
            Email
          </Text>
          <TextInput
            className="mt-2 rounded-2xl border border-line bg-card px-4 py-3 text-[15px] text-ink dark:border-line-dark dark:bg-card-dark dark:text-ink-dark"
            placeholder="demo@zentra.com"
            placeholderTextColor="#A79B8B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mt-5">
          <Text className="text-sm font-medium text-muted dark:text-muted-dark">
            Password
          </Text>
          <TextInput
            className="mt-2 rounded-2xl border border-line bg-card px-4 py-3 text-[15px] text-ink dark:border-line-dark dark:bg-card-dark dark:text-ink-dark"
            placeholder="********"
            placeholderTextColor="#A79B8B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-[13px] text-muted dark:text-muted-dark">
              Forgot password?
            </Text>
            <Pressable className="rounded-full bg-accent px-3 py-1 dark:bg-accent-dark">
              <Text className="text-xs font-semibold text-accent-ink dark:text-accent-ink-dark">
                Reset
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className="mt-6 rounded-2xl bg-primary py-4 shadow-lg dark:bg-primary-dark"
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
          <Text className="text-[13px] text-muted dark:text-muted-dark">
            Last sync 2 minutes ago
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
