import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSalesInvoiceQuery } from "../../../src/services/invoices/queries";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value);

const formatText = (value?: string | null) =>
  value && value.trim().length > 0 ? value : "--";

function SkeletonBlock({
  width,
  height,
  className,
}: {
  width?: number | string;
  height: number;
  className?: string;
}) {
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
        backgroundColor: "#E7DED1",
      }}
    />
  );
}

export default function SaleDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const invoiceId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { data, isLoading, error } = useSalesInvoiceQuery(invoiceId);

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <Stack.Screen options={{ title: "Sale details", headerShown: false }} />
      <View className="px-6 pt-4">
        <View className="flex-row items-center">
          <Pressable
            className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-line bg-card dark:border-line-dark dark:bg-card-dark"
            onPress={() => {
              // if (router.canGoBack()) {
              //   router.back();
              //   return;
              // }
              router.replace("/sale");
            }}
          >
            <Text className="text-[18px] text-ink dark:text-ink-dark">←</Text>
          </Pressable>
          <View>
            <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
              Sale details
            </Text>
            <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
              Invoice summary and line items.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pt-4 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="mt-6">
            <View className="rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <SkeletonBlock height={16} width={140} />
              <SkeletonBlock height={12} width={180} className="mt-3" />
              <SkeletonBlock height={12} width={160} className="mt-2" />
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              {Array.from({ length: 4 }).map((_, index) => (
                <View
                  key={`summary-skeleton-${index}`}
                  className="mb-3 w-[48%] rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark"
                >
                  <SkeletonBlock height={10} width={70} />
                  <SkeletonBlock height={14} width={100} className="mt-2" />
                </View>
              ))}
            </View>
            {/* 
            <View className="mt-2 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <SkeletonBlock height={12} width={90} />
              <SkeletonBlock height={10} width={140} className="mt-3" />
              <SkeletonBlock height={10} width={120} className="mt-2" />
            </View> */}

            <View className="mt-4">
              <SkeletonBlock height={14} width={120} />
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={`line-skeleton-${index}`}
                  className="mt-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
                >
                  <SkeletonBlock height={12} width={160} />
                  <SkeletonBlock height={10} width={120} className="mt-2" />
                  <SkeletonBlock height={10} width={140} className="mt-2" />
                </View>
              ))}
            </View>
          </View>
        ) : error || !data ? (
          <View className="mt-6 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Invoice not found
            </Text>
            <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
              Please go back and try another invoice.
            </Text>
          </View>
        ) : (
          <View>
            <View className="rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
                {data.invoice_id}
              </Text>
              <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                {new Date(data.date).toLocaleString()}
              </Text>
              <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                {data.customer_name ?? "Walk-in customer"}
              </Text>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              {[
                { label: "Subtotal", value: data.sub_total },
                { label: "Tax", value: data.tax_amount },
                { label: "Discount", value: data.discount_amount },
                { label: "Total", value: data.total_amount },
                { label: "Paid", value: data.amount_received },
                { label: "Outstanding", value: data.outstanding_balance },
              ].map((item) => (
                <View
                  key={item.label}
                  className="mb-3 w-[48%] rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark"
                >
                  <Text className="text-[12px] text-muted dark:text-muted-dark">
                    {item.label}
                  </Text>
                  <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                    {formatCurrency(item.value ?? 0)}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-2 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                Payment
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Mode
                </Text>
                <View className="rounded-full bg-accent px-2.5 py-1 dark:bg-accent-dark">
                  <Text className="text-[10px] font-semibold text-accent-ink dark:text-accent-ink-dark">
                    {formatText(data.payment_mode)}
                  </Text>
                </View>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  Status
                </Text>
                <View className="rounded-full bg-accent px-2.5 py-1 dark:bg-accent-dark">
                  <Text className="text-[10px] font-semibold text-accent-ink dark:text-accent-ink-dark">
                    {formatText(data.payment_status)}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
                Line items
              </Text>
              <View className="mt-3">
                {(data.sales_details ?? []).map((detail) => (
                  <View
                    key={detail.sales_detail_id}
                    className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
                  >
                    <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                      {detail.product_name ??
                        detail.custom_product_name ??
                        "Custom item"}
                    </Text>
                    <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                      Qty {detail.quantity} � {formatText(detail.unit)}
                    </Text>
                    <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                      Unit {formatCurrency(detail.unit_price)}
                    </Text>
                  </View>
                ))}
                {data.sales_details && data.sales_details.length === 0 ? (
                  <Text className="text-[13px] text-muted dark:text-muted-dark">
                    No line items available.
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
