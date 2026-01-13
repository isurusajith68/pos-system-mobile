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
import { LineChart } from "react-native-chart-kit";
import { BackButton } from "../../../components/BackButton";
import { SkeletonBlock } from "../../../components/SkeletonBlock";
import {
  useSalesDailyReport,
  useSalesSummaryReport,
} from "../../../src/services/reports/queries";

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }).format(value)
    : "--";

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const formatDayLabel = (value: string) => value.slice(5);

const normalizeDayKey = (value: string) => value.slice(0, 10);

const toDateKey = (value: Date) => value.toISOString().slice(0, 10);

const buildDateRange = (start: string, end: string) => {
  const dates: string[] = [];
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

export default function SalesSummaryReport() {
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

  const { data: summary, isLoading: isSummaryLoading } =
    useSalesSummaryReport(params);
  const { data: daily = [], isLoading: isDailyLoading } =
    useSalesDailyReport(params);

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

  const chartData = useMemo(() => {
    const totals = new Map<string, number>();
    const counts = new Map<string, number>();
    daily.forEach((item) => {
      const value = Number(item.total_amount ?? 0);
      const dayKey = normalizeDayKey(item.day);
      totals.set(dayKey, Number.isNaN(value) ? 0 : value);
      counts.set(dayKey, item.invoice_count ?? 0);
    });
    return buildDateRange(fromDate, toDate).map((day) => ({
      day,
      total: totals.get(day) ?? 0,
      count: counts.get(day) ?? 0,
    }));
  }, [daily, fromDate, toDate]);

  const chartWidth = useMemo(() => {
    const baseWidth = Dimensions.get("window").width - 48;
    const chartMinWidth = chartData.length * 18;
    return Math.max(baseWidth, chartMinWidth);
  }, [chartData.length]);

  const handleShare = async () => {
    const title = "Sales summary report";
    const range = `${fromDate} to ${toDate}`;
    const message = summary
      ? `Sales summary (${range})\nTotal: ${formatCurrency(
          summary.total_amount
        )}\nInvoices: ${summary.invoice_count ?? 0}`
      : `Sales summary (${range})\nNo summary data available.`;

    await Share.share({ title, message });
  };

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6">
        <View className="mt-4">
          <View className="flex-row items-center">
            <BackButton fallbackRoute="/reports" />
            <View>
              <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
                Sales summary
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Day-wise sales for the last month.
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
              Summary
            </Text>
            {isSummaryLoading ? (
              <View className="mt-3">
                <SkeletonBlock height={14} width={140} />
                <SkeletonBlock height={12} width={200} className="mt-2" />
                <SkeletonBlock height={12} width={180} className="mt-2" />
              </View>
            ) : summary ? (
              <View className="mt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[12px] text-muted dark:text-muted-dark">
                    Invoices
                  </Text>
                  <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                    {summary.invoice_count ?? 0}
                  </Text>
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-[12px] text-muted dark:text-muted-dark">
                    Total
                  </Text>
                  <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                    {formatCurrency(summary.total_amount)}
                  </Text>
                </View>


              </View>
            ) : (
              <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                No summary data.
              </Text>
            )}
          </View>

          <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Daily sales
            </Text>
            {isDailyLoading ? (
              <View className="mt-3">
                <SkeletonBlock height={120} width="100%" />
              </View>
            ) : chartData.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={{
                    labels: chartData.map((item, index) =>
                      index % 5 === 0 || index === chartData.length - 1
                        ? formatDayLabel(item.day)
                        : ""
                    ),
                    datasets: [
                      {
                        data: chartData.map((item) => item.total),
                        color: () => (isDark ? "#1E3A8A" : "#1E3A8A"),
                        strokeWidth: 2,
                      },
                    ],
                  }}
                  width={chartWidth}
                  height={220}
                  withDots={true}
                  withShadow={false}
                  fromZero={true}
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
                    propsForDots: {
                      r: "3",
                      strokeWidth: "2",
                      stroke: isDark ? "#FACC15" : "#FACC15",
                    },
                    propsForBackgroundLines: {
                      stroke: isDark ? "#14532D" : "#86EFAC",
                    },
                  }}
                  bezier
                  style={{ marginTop: 16, borderRadius: 16 }}
                />
              </ScrollView>
            ) : (
              <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                No daily sales found.
              </Text>
            )}
          </View>

          <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Daily details
            </Text>
            <View className="mt-3">
              {isDailyLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <View key={`daily-detail-skeleton-${index}`} className="mb-3">
                    <SkeletonBlock height={12} width={180} />
                    <SkeletonBlock height={10} width={120} className="mt-2" />
                  </View>
                ))
              ) : chartData.length ? (
                chartData.map((item) => (
                  <View
                    key={`daily-detail-${item.day}`}
                    className="mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                        {item.day}
                      </Text>
                      <Text className="mt-1 text-[11px] text-muted dark:text-muted-dark">
                        Bills {item.count}
                      </Text>
                    </View>
                    <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                      {formatCurrency(item.total)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  No daily sales found.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
