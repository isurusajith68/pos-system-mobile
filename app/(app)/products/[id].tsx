import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useProductQuery } from "../../../src/services/products/queries";
import { BackButton } from "../../../components/BackButton";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value);

const formatNumber = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString("en-LK") : "--";

const formatText = (value?: string | null) =>
  value && value.trim().length > 0 ? value : "--";

const formatShortId = (value?: string | null) =>
  value && value.trim().length > 0 ? `#${value.slice(-8)}` : "--";

function SkeletonBlock({
  width,
  height,
  className,
}: {
  width?: number | string;
  height: number;
  className?: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={{
        width,
        height,
        opacity,
        borderRadius: 999,
        backgroundColor: isDark ? "#242726" : "#E7DED1",
      }}
    />
  );
}

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { data, isLoading, error } = useProductQuery(productId);

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <Stack.Screen
        options={{ title: "Product details", headerShown: false }}
      />
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center">
            <BackButton fallbackRoute="/products" />
          <View>
            <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
              Product details
            </Text>
            <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
              View pricing, inventory, and category data.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-32"
        showsVerticalScrollIndicator={false}
      >

        {isLoading ? (
          <View className="mt-6 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <SkeletonBlock height={20} width={180} />
            <SkeletonBlock height={12} width={140} className="mt-3" />
            <SkeletonBlock height={12} width={200} className="mt-2" />

            <View className="mt-4 flex-row flex-wrap justify-between">
              {Array.from({ length: 6 }).map((_, index) => (
                <View
                  key={`skeleton-card-${index}`}
                  className="mb-3 w-[48%] rounded-2xl bg-accent px-3 py-3 dark:bg-accent-dark"
                >
                  <SkeletonBlock height={10} width={60} />
                  <SkeletonBlock height={14} width={90} className="mt-2" />
                </View>
              ))}
            </View>

            <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <SkeletonBlock height={12} width={90} />
              <SkeletonBlock height={10} width={180} className="mt-3" />
              <SkeletonBlock height={10} width={150} className="mt-2" />
              <SkeletonBlock height={10} width={140} className="mt-2" />
            </View>
          </View>
        ) : error || !data ? (
          <View className="mt-10 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Product not found
            </Text>
            <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
              Please go back and try another item.
            </Text>
          </View>
        ) : (
          <View className="mt-6 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[18px] font-semibold text-ink dark:text-ink-dark">
              {data.name}
            </Text>
            <Text className="mt-2 text-[13px] text-muted dark:text-muted-dark">
              {data.category_name ?? "Uncategorized"}
            </Text>
            <Text className="mt-2 text-[13px] text-muted dark:text-muted-dark">
              {formatText(data.brand)} · {formatText(data.english_name)}
            </Text>
            <View
              className={`mt-3 self-start rounded-full px-3 py-1 ${
                (data.stock_level ?? 0) <= 0
                  ? "bg-[#FCEAEA] dark:bg-[#2B1B1B]"
                  : (data.stock_level ?? 0) <= 10
                    ? "bg-[#FFF4EC] dark:bg-[#241B16]"
                    : "bg-accent dark:bg-accent-dark"
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  (data.stock_level ?? 0) <= 0
                    ? "text-[#9B2C2C] dark:text-[#F29B9B]"
                    : (data.stock_level ?? 0) <= 10
                      ? "text-[#8B3A1A] dark:text-[#F2B397]"
                      : "text-accent-ink dark:text-accent-ink-dark"
                }`}
              >
                {(data.stock_level ?? 0) <= 0
                  ? "Out of stock"
                  : (data.stock_level ?? 0) <= 10
                    ? "Low stock"
                    : "In stock"}
              </Text>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              <View className="mb-3 w-[48%] rounded-2xl bg-accent px-3 py-3 dark:bg-accent-dark">
                <Text className="text-[11px] text-muted dark:text-muted-dark">
                  Price
                </Text>
                <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                  {formatCurrency(data.price)}
                </Text>
              </View>
              <View className="mb-3 w-[48%] rounded-2xl bg-accent px-3 py-3 dark:bg-accent-dark">
                <Text className="text-[11px] text-muted dark:text-muted-dark">
                  Cost price
                </Text>
                <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                  {formatCurrency(data.cost_price ?? 0)}
                </Text>
              </View>
              <View className="mb-3 w-[48%] rounded-2xl bg-accent px-3 py-3 dark:bg-accent-dark">
                <Text className="text-[11px] text-muted dark:text-muted-dark">
                  Discounted price
                </Text>
                <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                  {typeof data.discounted_price === "number"
                    ? formatCurrency(data.discounted_price)
                    : "--"}
                </Text>
              </View>
              <View className="mb-3 w-[48%] rounded-2xl bg-accent px-3 py-3 dark:bg-accent-dark">
                <Text className="text-[11px] text-muted dark:text-muted-dark">
                  Wholesale
                </Text>
                <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                  {typeof data.wholesale === "number"
                    ? formatCurrency(data.wholesale)
                    : "--"}
                </Text>
              </View>
              <View className="mb-3 w-[48%] rounded-2xl bg-accent px-3 py-3 dark:bg-accent-dark">
                <Text className="text-[11px] text-muted dark:text-muted-dark">
                  Tax inclusive
                </Text>
                <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                  {typeof data.tax_inclusive_price === "number"
                    ? formatCurrency(data.tax_inclusive_price)
                    : "--"}
                </Text>
              </View>
              <View className="mb-3 w-[48%] rounded-2xl bg-accent px-3 py-3 dark:bg-accent-dark">
                <Text className="text-[11px] text-muted dark:text-muted-dark">
                  Tax rate
                </Text>
                <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                  {typeof data.tax_rate === "number"
                    ? `${data.tax_rate}%`
                    : "--"}
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                Inventory
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Stock level
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatNumber(data.stock_level)}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Unit
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatText(data.unit)}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Unit size
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatText(data.unit_size)}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Unit type
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatText(data.unit_type)}
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                Identifiers
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Product ID
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatShortId(data.product_id)}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  SKU
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatText(data.sku)}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Barcode
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatText(data.barcode)}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Category ID
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {formatShortId(data.category_id)}
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                Metadata
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Created
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {data.created_at
                    ? new Date(data.created_at).toLocaleString()
                    : "--"}
                </Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Updated
                </Text>
                <Text className="text-[12px] font-semibold text-ink dark:text-ink-dark">
                  {data.updated_at
                    ? new Date(data.updated_at).toLocaleString()
                    : "--"}
                </Text>
              </View>
            </View>

            {data.description ? (
              <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
                <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                  Description
                </Text>
                <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                  {data.description}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
