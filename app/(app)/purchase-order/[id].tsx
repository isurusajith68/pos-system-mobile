import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  type PurchaseOrderItem,
  usePurchaseOrderQuery,
} from "../../../src/services/purchaseOrders/queries";
import { BackButton } from "../../../components/BackButton";
import { SkeletonBlock } from "../../../components/SkeletonBlock";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value);

const formatText = (value?: string | null) =>
  value && value.trim().length > 0 ? value : "--";

export default function PurchaseOrderDetails() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const poId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const { data, isLoading, error } = usePurchaseOrderQuery(poId);

  const renderItemRow = (item: PurchaseOrderItem) => (
    <View
      key={item.po_item_id}
      className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
    >
      <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
        {item.product_name}
      </Text>
      <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
        Qty {item.quantity} x {formatText(item.unit)}
      </Text>
      <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
        Unit {formatCurrency(item.unit_price)}
      </Text>
    </View>
  );

  const renderSkeletonRow = (index: number) => (
    <View
      key={`po-item-skeleton-${index}`}
      className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
    >
      <SkeletonBlock height={14} width={160} />
      <SkeletonBlock height={12} width={120} className="mt-2" />
      <SkeletonBlock height={12} width={140} className="mt-2" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <Stack.Screen options={{ title: "Purchase order", headerShown: false }} />
      <View className="px-6 pt-4">
        <View className="flex-row items-center">
            <BackButton fallbackRoute="/purchase-order" />
          <View>
            <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
              Purchase order details
            </Text>
            <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
              Order summary and supplier details.
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
          <View className="mt-4">
            <View className="rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <SkeletonBlock height={16} width={160} />
              <SkeletonBlock height={12} width={110} className="mt-3" />
              <SkeletonBlock height={12} width={180} className="mt-2" />
            </View>

            <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <SkeletonBlock height={12} width={120} />
              <SkeletonBlock height={10} width={200} className="mt-3" />
              <SkeletonBlock height={10} width={160} className="mt-2" />
              <SkeletonBlock height={10} width={180} className="mt-2" />
              <SkeletonBlock height={10} width={220} className="mt-2" />
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              {Array.from({ length: 2 }).map((_, index) => (
                <View
                  key={`summary-skeleton-${index}`}
                  className="mb-3 w-[48%] rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark"
                >
                  <SkeletonBlock height={10} width={70} />
                  <SkeletonBlock height={14} width={90} className="mt-2" />
                </View>
              ))}
            </View>

            <View className="mt-2">
              <SkeletonBlock height={14} width={90} />
              <View className="mt-3">
                {Array.from({ length: 3 }).map((_, index) =>
                  renderSkeletonRow(index)
                )}
              </View>
            </View>
          </View>
        ) : error || !data ? (
          <View className="mt-6 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Purchase order not found
            </Text>
            <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
              Please go back and try another order.
            </Text>
          </View>
        ) : (
          <View>
            <View className="rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
                {data.supplier.name}
              </Text>
              <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                #{data.po_id.slice(-8)}
              </Text>
              <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                {new Date(data.order_date).toLocaleString()}
              </Text>
            </View>

            <View className="mt-4 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
              <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                Supplier details
              </Text>
              <Text className="mt-3 text-[12px] text-muted dark:text-muted-dark">
                Contact {formatText(data.supplier.contact_name)}
              </Text>
              <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                Phone {formatText(data.supplier.phone)}
              </Text>
              <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                Email {formatText(data.supplier.email)}
              </Text>
              <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
                Address {formatText(data.supplier.address)}
              </Text>
            </View>

            <View className="mt-4 flex-row flex-wrap justify-between">
              {[
                { label: "Total", value: data.total_amount },
                { label: "Status", value: formatText(data.status) },
              ].map((item) => (
                <View
                  key={item.label}
                  className="mb-3 w-[48%] rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark"
                >
                  <Text className="text-[12px] text-muted dark:text-muted-dark">
                    {item.label}
                  </Text>
                  <Text className="mt-2 text-[16px] font-semibold text-ink dark:text-ink-dark">
                    {item.label === "Total"
                      ? formatCurrency(item.value as number)
                      : (item.value as string)}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-2">
              <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
                Items
              </Text>
              <View className="mt-3">
                {data.items.length > 0 ? (
                  data.items.map(renderItemRow)
                ) : (
                  <Text className="text-[13px] text-muted dark:text-muted-dark">
                    No items available.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
