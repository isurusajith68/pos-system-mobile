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
import { PieChart } from "react-native-chart-kit";
import { BackButton } from "../../../components/BackButton";
import { SkeletonBlock } from "../../../components/SkeletonBlock";
import { useProductPerformanceReport } from "../../../src/services/reports/queries";

const formatCurrency = (value?: number | null) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }).format(value)
    : "--";

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

export default function ProductPerformanceReport() {
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

  const { data = [], isLoading } = useProductPerformanceReport(params);
  const topProducts = useMemo(() => data.slice(0, 10), [data]);
  const chartColors = [
    "#1E3A8A",
    "#22C55E",
    "#FACC15",
    "#16A34A",
    "#0F766E",
    "#1D4ED8",
    "#84CC16",
    "#CA8A04",
    "#0E7490",
    "#065F46",
  ];
  const chartWidth = useMemo(
    () => Dimensions.get("window").width - 48,
    []
  );
  const chartData = useMemo(() => {
    return topProducts
      .map((item, index) => {
        const value = Math.max(0, Number(item.sales_amount ?? 0));
        return {
          name: item.product_name,
          value: Number.isNaN(value) ? 0 : value,
          quantity: item.quantity_sold ?? 0,
          color: chartColors[index % chartColors.length],
          legendFontColor: isDark ? "#A79B8B" : "#6B6257",
          legendFontSize: 11,
        };
      })
      .filter((item) => item.value > 0);
  }, [topProducts, isDark]);

  const handleShare = async () => {
    const title = "Product performance report";
    const range = `${fromDate} to ${toDate}`;
    const topLines = topProducts
      .slice(0, 5)
      .map(
        (item, index) =>
          `${index + 1}. ${item.product_name} - ${formatCurrency(
            item.sales_amount
          )} (Qty ${item.quantity_sold ?? 0})`
      );
    const message = [
      `Product performance (${range})`,
      topLines.length ? topLines.join("\n") : "No product data available.",
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
                Product performance
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Top selling products by revenue.
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
          <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Best sellers (Top 10)
            </Text>
            {isLoading ? (
              <View className="mt-3">
                <SkeletonBlock height={160} width="100%" />
              </View>
            ) : chartData.length ? (
              <View className="mt-3">
                <View className="items-center">
                  <PieChart
                    data={chartData}
                    width={chartWidth}
                    height={300}
                    accessor="value"
                    backgroundColor="transparent"
                    hasLegend={false}
                    center={[Math.max(0, Math.floor((chartWidth - 200) / 2)), 0]}
                    paddingLeft="0"
                    chartConfig={{
                      color: (opacity = 1) =>
                        isDark
                          ? `rgba(34, 197, 94, ${opacity})`
                          : `rgba(34, 197, 94, ${opacity})`,
                    }}
                    style={{ alignSelf: "center" }}
                  />
                </View>
                <View className="mt-2">
                  {chartData.map((item) => (
                    <View
                      key={item.name}
                      className="mb-2 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <View
                          className="mr-2 h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <Text className="text-[11px] text-muted dark:text-muted-dark">
                          {item.name}
                        </Text>
                      </View>
                      <View className="flex flex-row">
                        <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                          {formatCurrency(item.value)}
                        </Text>
                        <Text className="text-[11px] ml-5 font-semibold text-accent-ink dark:text-accent-ink-dark">
                          Qty {item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                No data to chart.
              </Text>
            )}
          </View>
          {/* <View className="rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Best sellers (Top 10)
            </Text>
            <View className="mt-3">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <View key={`product-skeleton-${index}`} className="mb-3">
                    <SkeletonBlock height={12} width={180} />
                    <SkeletonBlock height={10} width={120} className="mt-2" />
                  </View>
                ))
              ) : topProducts.length ? (
                topProducts.map((item) => (
                  <View
                    key={item.product_id}
                    className="mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                        {item.product_name}
                      </Text>
                      <Text className="mt-1 text-[11px] text-muted dark:text-muted-dark">
                        Qty {item.quantity_sold}
                      </Text>
                    </View>
                    <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                      {formatCurrency(item.sales_amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  No product sales in this range.
                </Text>
              )}
            </View>
          </View> */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
