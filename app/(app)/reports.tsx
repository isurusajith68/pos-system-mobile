import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";

export default function Reports() {
  return (
    <SafeAreaView className="flex-1 bg-[#FBF7F0]">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[20px] font-semibold text-[#1E1B16]">
          Reports
        </Text>
        <Text className="mt-2 text-[14px] text-[#6B6257]">
          Track sales, trends, and performance.
        </Text>
      </View>
    </SafeAreaView>
  );
}
