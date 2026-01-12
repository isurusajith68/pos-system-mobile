import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function Sale() {
  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[20px] font-semibold text-ink dark:text-ink-dark">
          New Sale
        </Text>
        <Text className="mt-2 text-[14px] text-muted dark:text-muted-dark">
          Start a fresh transaction.
        </Text>
      </View>
    </SafeAreaView>
  );
}
