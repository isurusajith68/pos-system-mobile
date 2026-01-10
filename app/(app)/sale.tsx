import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function Sale() {
  return (
    <SafeAreaView className="flex-1 bg-[#FBF7F0] dark:bg-[#0F1110]">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[20px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
          New Sale
        </Text>
        <Text className="mt-2 text-[14px] text-[#6B6257] dark:text-[#A79B8B]">
          Start a fresh transaction.
        </Text>
      </View>
    </SafeAreaView>
  );
}
