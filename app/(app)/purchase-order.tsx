import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../../components/BackButton";
import { SkeletonBlock } from "../../components/SkeletonBlock";
import type { PurchaseOrder as PurchaseOrderType } from "../../src/services/purchaseOrders/queries";
import {
  usePurchaseOrdersQuery,
  usePurchaseOrderStatsQuery,
} from "../../src/services/purchaseOrders/queries";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value);

export default function PurchaseOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [poList, setPoList] = useState<PurchaseOrderType[]>([]);
  const limit = 20;

  const debouncedSearch = useMemo(() => search.trim(), [search]);
  const { data: stats } = usePurchaseOrderStatsQuery();
  const { data, isLoading, isFetching } = usePurchaseOrdersQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const orders = data?.rows ?? [];
  const hasMore = orders.length === limit;

  useEffect(() => {
    setPage(1);
    setPoList([]);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setPoList((prev) => {
      if (page === 1) {
        return data.rows;
      }
      const existing = new Set(prev.map((item) => item.po_id));
      const next = data.rows.filter((item) => !existing.has(item.po_id));
      return [...prev, ...next];
    });
  }, [data, page]);

  const renderOrder = ({ item }: { item: PurchaseOrderType }) => (
    <Pressable
      onPress={() => router.push(`/purchase-order/${item.po_id}`)}
      className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">
            {item.supplier_name}
          </Text>
          <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
            #{item.po_id.slice(-8)}
          </Text>
          <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
            {new Date(item.order_date).toLocaleDateString()}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[14px] font-semibold text-[#F97316] dark:text-[#F59E0B]">
            {formatCurrency(item.total_amount)}
          </Text>
          <View className="mt-2 rounded-full bg-accent px-2.5 py-1 dark:bg-accent-dark">
            <Text className="text-[10px] font-semibold text-accent-ink dark:text-accent-ink-dark">
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6">
        <View className="mt-4">
          <View className="flex-row items-center">
            <BackButton fallbackRoute="/dashboard" />
            <View>
              <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
                Purchase orders
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Create and track supplier orders.
              </Text>
            </View>
            <Pressable
              className="ml-auto rounded-full bg-accent px-3 py-2 dark:bg-accent-dark"
              onPress={() => {
                queryClient.invalidateQueries({
                  queryKey: ["purchase-orders"],
                });
                queryClient.invalidateQueries({ queryKey: ["suppliers"] });
              }}
            >
              <Text className="text-xs font-semibold text-accent-ink dark:text-accent-ink-dark">
                Refresh
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-[12px] text-muted dark:text-muted-dark">
            Overview
          </Text>
          <View className="mt-3 flex-row flex-wrap justify-between">
            {[
              { label: "Total", value: stats?.total ?? "--" },
              { label: "Pending", value: stats?.pending ?? "--" },
              { label: "Received", value: stats?.received ?? "--" },
              { label: "Cancelled", value: stats?.cancelled ?? "--" },
            ].map((item) => (
              <View
                key={item.label}
                className="mb-3 w-[24%] rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark"
              >
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  {item.label}
                </Text>
                <Text className="mt-2 text-[20px] font-semibold text-ink dark:text-ink-dark">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5 flex-row items-center rounded-2xl border border-line bg-accent px-3 py-1 dark:border-line-dark dark:bg-accent-dark">
          <TextInput
            className="flex-1 text-[15px] text-ink dark:text-ink-dark"
            placeholder="Search supplier"
            placeholderTextColor="#A79B8B"
            value={search}
            onChangeText={setSearch}
          />
          {search.trim().length > 0 ? (
            <Pressable
              className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-accent dark:bg-accent-dark"
              onPress={() => setSearch("")}
            >
              <Text className="text-[16px] text-accent-ink dark:text-accent-ink-dark">
                x
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-4 mb-2">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            Purchase orders
          </Text>
        </View>

        <FlatList
          className="flex-1"
          data={poList}
          keyExtractor={(item) => item.po_id}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={true}
          contentContainerClassName="pt-3 pb-32"
          ListEmptyComponent={
            isLoading ? (
              <View>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={`po-skeleton-${index}`}
                    className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <SkeletonBlock height={14} width={140} />
                        <SkeletonBlock
                          height={12}
                          width={120}
                          className="mt-2"
                        />
                        <SkeletonBlock
                          height={12}
                          width={160}
                          className="mt-2"
                        />
                      </View>
                      <View className="items-end">
                        <SkeletonBlock height={14} width={80} />
                        <SkeletonBlock
                          height={18}
                          width={60}
                          className="mt-2"
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[13px] text-muted dark:text-muted-dark">
                No purchase orders found.
              </Text>
            )
          }
          ListFooterComponent={
            !isLoading && poList.length > 0 ? (
              <Pressable
                className="mt-2 items-center rounded-2xl border border-line bg-card px-4 py-3 dark:border-line-dark dark:bg-card-dark"
                disabled={!hasMore || isFetching}
                onPress={() => {
                  if (hasMore) {
                    setPage((prev) => prev + 1);
                  }
                }}
              >
                <Text className="text-[13px] font-semibold text-ink dark:text-ink-dark">
                  {hasMore
                    ? isFetching
                      ? "Loading..."
                      : "Load more"
                    : "No more orders"}
                </Text>
              </Pressable>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
