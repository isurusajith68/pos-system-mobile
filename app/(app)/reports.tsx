import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../../components/BackButton";
import { useSalesSummaryReport } from "../../src/services/reports/queries";

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }).format(value)
    : "--";

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

export default function Reports() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const endDate = useMemo(() => formatDateInput(today), [today]);
  const startDate = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return formatDateInput(start);
  }, [today]);

  const params = useMemo(
    () => ({
      start: startDate,
      end: endDate,
    }),
    [startDate, endDate]
  );

  const { data: summary } = useSalesSummaryReport(params);

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6">
        <View className="mt-4">
          <View className="flex-row items-center">
            <BackButton fallbackRoute="/dashboard" />
            <View>
              <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
                Reports
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Track sales, trends, and performance.
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="mt-4"
          contentContainerClassName="pb-32"
          showsVerticalScrollIndicator={false}
        >
          {[
            {
              title: "Sales summary",
              subtitle: "Day-wise sales and totals.",
              route: "/reports/sales-summary",
              icon: "S",
            },
            {
              title: "Product performance",
              subtitle: "Top products by revenue.",
              route: "/reports/product-performance",
              icon: "P",
            },
            {
              title: "Customer insights",
              subtitle: "Top customers by spend.",
              route: "/reports/customer-insights",
              icon: "C",
            },
            {
              title: "Employee sales",
              subtitle: "Sales totals by employee.",
              route: "/reports/employee-sales",
              icon: "E",
            },
          ].map((card) => (
            <Pressable
              key={card.title}
              onPress={() => router.push(card.route)}
              className="mb-3 overflow-hidden rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
            >
              <View className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent opacity-70 dark:bg-accent-dark" />
              <View className="flex-row items-center">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent dark:bg-accent-dark">
                  <Text className="text-[16px] font-semibold text-accent-ink dark:text-accent-ink-dark">
                    {card.icon}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
                    {card.title}
                  </Text>
                  <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                    {card.subtitle}
                  </Text>
                </View>
                <Text className="text-[16px] text-muted dark:text-muted-dark">
                  &gt;
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
