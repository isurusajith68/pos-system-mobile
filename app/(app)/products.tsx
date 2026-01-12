import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function Products() {
  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[20px] font-semibold text-ink dark:text-ink-dark">
          Products
        </Text>
        <Text className="mt-2 text-[14px] text-muted dark:text-muted-dark">
          Manage items, pricing, and categories.
        </Text>
      </View>
    </SafeAreaView>
  );
}
