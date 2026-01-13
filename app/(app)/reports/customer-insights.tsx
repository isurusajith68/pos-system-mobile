import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { BarChart } from "react-native-chart-kit";
import { BackButton } from "../../../components/BackButton";
import { SkeletonBlock } from "../../../components/SkeletonBlock";
import { useCustomerInsightsReport } from "../../../src/services/reports/queries";

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }).format(value)
    : "--";

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);
const formatShortLabel = (value: string) =>
  value.length > 6 ? value.slice(0, 6) : value;

export default function CustomerInsightsReport() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const today = useMemo(() => new Date(), []);
  const defaultEnd = useMemo(() => formatDateInput(today), [today]);
  const defaultStart = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return formatDateInput(start);
  }, [today]);

  const [fromDate, setFromDate] = useState(defaultStart);
  const [toDate, setToDate] = useState(defaultEnd);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const params = useMemo(
    () => ({
      start: fromDate,
      end: toDate,
    }),
    [fromDate, toDate]
  );

  const { data = [], isLoading } = useCustomerInsightsReport(params);
  const topCustomers = useMemo(() => data.slice(0, 10), [data]);
  const chartWidth = useMemo(
    () => Dimensions.get("window").width - 48,
    []
  );
  const barData = useMemo(
    () => ({
      labels: topCustomers.map((item) => formatShortLabel(item.name)),
      datasets: [
        {
          data: topCustomers.map((item) => item.total_spent ?? 0),
        },
      ],
    }),
    [topCustomers]
  );

  const handleShare = async () => {
    const title = "Customer insights report";
    const range = `${fromDate} to ${toDate}`;
    const topLines = topCustomers
      .slice(0, 5)
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} - ${formatCurrency(
            item.total_spent
          )} (Bills ${item.invoice_count ?? 0})`
      );
    const message = [
      `Customer insights (${range})`,
      topLines.length ? topLines.join("\n") : "No customer data available.",
    ].join("\n");

    await Share.share({ title, message });
  };

  const handleDateChange =
    (type: "from" | "to") => (_event: DateTimePickerEvent, date?: Date) => {
      if (!date) {
        if (type === "from") {
          setShowFromPicker(false);
        } else {
          setShowToPicker(false);
        }
        return;
      }

      if (type === "from") {
        setFromDate(formatDateInput(date));
        setShowFromPicker(false);
      } else {
        setToDate(formatDateInput(date));
        setShowToPicker(false);
      }
    };

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6">
        <View className="mt-4">
          <View className="flex-row items-center">
            <BackButton fallbackRoute="/reports" />
            <View>
              <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
                Customer insights
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Top customers by spend.
              </Text>
            </View>
            <Pressable
              className="ml-auto rounded-full bg-accent px-3 py-2 dark:bg-accent-dark"
              onPress={handleShare}
            >
              <Text className="text-xs font-semibold text-accent-ink dark:text-accent-ink-dark">
                Share
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-4 flex-row">
          <View className="mr-3 flex-1 rounded-2xl border border-line bg-accent px-3 py-2 dark:border-line-dark dark:bg-accent-dark">
            <Text className="text-[11px] text-muted dark:text-muted-dark">
              From
            </Text>
            <Pressable className="mt-1" onPress={() => setShowFromPicker(true)}>
              <Text className="text-[13px] text-ink dark:text-ink-dark">
                {fromDate}
              </Text>
            </Pressable>
          </View>
          <View className="flex-1 rounded-2xl border border-line bg-accent px-3 py-2 dark:border-line-dark dark:bg-accent-dark">
            <Text className="text-[11px] text-muted dark:text-muted-dark">
              To
            </Text>
            <Pressable className="mt-1" onPress={() => setShowToPicker(true)}>
              <Text className="text-[13px] text-ink dark:text-ink-dark">
                {toDate}
              </Text>
            </Pressable>
          </View>
        </View>

        {showFromPicker ? (
          <DateTimePicker
            mode="date"
            value={new Date(fromDate)}
            onChange={handleDateChange("from")}
          />
        ) : null}
        {showToPicker ? (
          <DateTimePicker
            mode="date"
            value={new Date(toDate)}
            onChange={handleDateChange("to")}
          />
        ) : null}

        <ScrollView
          className="mt-4"
          contentContainerClassName="pb-32"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Results
            </Text>
            <View className="mt-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <View key={`customer-skeleton-${index}`} className="mb-3">
                    <SkeletonBlock height={12} width={160} />
                    <SkeletonBlock height={10} width={120} className="mt-2" />
                  </View>
                ))
              ) : topCustomers.length ? (
                topCustomers.map((item) => (
                  <View
                    key={item.customer_id}
                    className="mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                        {item.name}
                      </Text>
                      <Text className="mt-1 text-[11px] text-muted dark:text-muted-dark">
                        Bills {item.invoice_count}
                      </Text>
                    </View>
                    <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                      {formatCurrency(item.total_spent)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  No customer data.
                </Text>
              )}
            </View>
          </View>

          <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Sales by customer
            </Text>
            {isLoading ? (
              <View className="mt-3">
                <SkeletonBlock height={160} width="100%" />
              </View>
            ) : topCustomers.length ? (
              <View className="mt-3">
                <BarChart
                  data={barData}
                  width={chartWidth}
                  height={220}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: isDark ? "#1F2321" : "#F9FAFB",
                    backgroundGradientFrom: isDark ? "#1F2321" : "#F9FAFB",
                    backgroundGradientTo: isDark ? "#1F2321" : "#F9FAFB",
                    decimalPlaces: 0,
                    color: (opacity = 1) =>
                      isDark
                        ? `rgba(34, 197, 94, ${opacity})`
                        : `rgba(34, 197, 94, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      isDark
                        ? `rgba(167, 155, 139, ${opacity})`
                        : `rgba(107, 98, 87, ${opacity})`,
                  }}
                  style={{ borderRadius: 16 }}
                />
              </View>
            ) : (
              <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                No customer data.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
