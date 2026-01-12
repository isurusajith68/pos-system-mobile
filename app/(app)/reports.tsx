import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function Reports() {
  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[20px] font-semibold text-ink dark:text-ink-dark">
          Reports
        </Text>
        <Text className="mt-2 text-[14px] text-muted dark:text-muted-dark">
          Track sales, trends, and performance.
        </Text>
      </View>
    </SafeAreaView>
  );
}
