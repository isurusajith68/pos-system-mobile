import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { BackButton } from "../../components/BackButton";
import { SkeletonBlock } from "../../components/SkeletonBlock";
import {
  InventoryItem,
  useInventoryQuery,
  useInventoryStatsQuery,
} from "../../src/services/inventory/queries";

const formatCurrency = (value?: number | string | null) => {
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }).format(parsed);
    }
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(value);
  }

  return "--";
};

const formatNumber = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString("en-LK") : "--";

export default function Inventory() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [stockFilter, setStockFilter] = useState<
    "all" | "in" | "low" | "out"
  >("all");
  const [page, setPage] = useState(1);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const limit = 20;

  const debouncedSearch = useMemo(() => search.trim(), [search]);
  const { data: stats } = useInventoryStatsQuery(threshold);
  const { data, isLoading, isFetching } = useInventoryQuery({
    page,
    limit,
    search: debouncedSearch,
    stockFilter,
    threshold,
  });

  const items = data?.rows ?? [];
  const hasMore = items.length === limit;

  useEffect(() => {
    setPage(1);
    setInventoryList([]);
  }, [debouncedSearch, stockFilter, threshold]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setInventoryList((prev) => {
      if (page === 1) {
        return data.rows;
      }
      const existing = new Set(prev.map((item) => item.inventory_id));
      const next = data.rows.filter((item) => !existing.has(item.inventory_id));
      return [...prev, ...next];
    });
  }, [data, page]);

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const qty = item.quantity ?? 0;
    const isLowStock = qty > 0 && qty <= threshold;
    const isOut = qty <= 0;
    const totalValue =
      typeof item.product_price === "number"
        ? item.product_price * qty
        : null;

    return (
      <View
        // onPress={() => router.push(`/products/${item.product_id}`)}
        className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
      >
        <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">
          {item.product_name}
        </Text>
        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[11px] text-muted dark:text-muted-dark">
              Current stock
            </Text>
            <Text className="mt-1 text-[13px] font-semibold text-ink dark:text-ink-dark">
              {formatNumber(qty)}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-[11px] text-muted dark:text-muted-dark">
              Status
            </Text>
            <View
              className={`mt-1 rounded-full px-2.5 py-1 ${
                isOut
                  ? "bg-[#FCEAEA] dark:bg-[#2B1B1B]"
                  : isLowStock
                    ? "bg-[#FFF4EC] dark:bg-[#241B16]"
                    : "bg-accent dark:bg-accent-dark"
              }`}
            >
              <Text
                className={`text-[10px] font-semibold ${
                  isOut
                    ? "text-[#9B2C2C] dark:text-[#F29B9B]"
                    : isLowStock
                      ? "text-[#8B3A1A] dark:text-[#F2B397]"
                      : "text-accent-ink dark:text-accent-ink-dark"
                }`}
              >
                {isOut ? "Out" : isLowStock ? "Low" : "In"}
              </Text>
            </View>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-[11px] text-muted dark:text-muted-dark">
              Total value
            </Text>
            <Text className="text-[14px] font-semibold text-[#F97316] dark:text-[#F59E0B]">
              {formatCurrency(totalValue)}
            </Text>
          </View>
        </View>
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-[11px] text-muted dark:text-muted-dark">
            Batch {item.batch_number ?? "--"}
          </Text>
          <Text className="text-[11px] text-muted dark:text-muted-dark">
            Reorder {formatNumber(item.reorder_level)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6">
        <View className="mt-4">
          <View className="flex-row items-center">
            <BackButton fallbackRoute="/dashboard" />
            <View>
              <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
                Inventory
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Track stock levels and reorder points.
              </Text>
            </View>
            <Pressable
              className="ml-auto rounded-full bg-accent px-3 py-2 dark:bg-accent-dark"
              onPress={() => {
                queryClient.invalidateQueries({ queryKey: ["inventory"] });
              }}
            >
              <Text className="text-xs font-semibold text-accent-ink dark:text-accent-ink-dark">
                Refresh
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              Inventory overview
            </Text>
            <View className="flex-row">
              {[5, 10, 20].map((value) => {
                const isActive = threshold === value;
                return (
                  <Pressable
                    key={value}
                    className={`ml-2 rounded-full border px-3 py-1 ${
                      isActive
                        ? "border-transparent bg-accent dark:bg-accent-dark"
                        : "border-line bg-card dark:border-line-dark dark:bg-card-dark"
                    }`}
                    onPress={() => setThreshold(value)}
                  >
                    <Text
                      className={`text-[11px] font-semibold ${
                        isActive
                          ? "text-accent-ink dark:text-accent-ink-dark"
                          : "text-muted dark:text-muted-dark"
                      }`}
                    >
                      {`Low <= ${value}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View className="mt-3 flex-row flex-wrap justify-between">
            {[
              {
                label: "Inventory value",
                value: stats ? formatCurrency(stats.inventory_value) : "--",
              },
              { label: "Total items", value: stats?.total ?? "--" },
            ].map((item) => (
              <View
                key={item.label}
                className="mb-3 w-[48%] rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark"
              >
                <Text className="text-[12px] text-muted dark:text-muted-dark">
                  {item.label}
                </Text>
                <Text className="mt-2 text-[18px] font-semibold text-ink dark:text-ink-dark">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-2 flex-row items-center rounded-2xl border border-line bg-card px-3 py-1 dark:border-line-dark dark:bg-card-dark">
          <TextInput
            className="flex-1 text-[15px] text-ink dark:text-ink-dark"
            placeholder="Search inventory"
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

        <View className="mt-4">
          <Text className="text-[12px] text-muted dark:text-muted-dark">
            Stock filter
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            className="mt-2"
          >
            {[
              { label: "All", value: "all" },
              { label: "In stock", value: "in" },
              { label: "Low stock", value: "low" },
              { label: "Out stock", value: "out" },
            ].map((item) => {
              const isActive = stockFilter === item.value;
              return (
                <Pressable
                  key={item.value}
                  className={`mr-2 rounded-full border px-4 py-2 ${
                    isActive
                      ? "border-transparent bg-primary dark:bg-primary-dark"
                      : "border-line bg-card dark:border-line-dark dark:bg-card-dark"
                  }`}
                  onPress={() =>
                    setStockFilter(item.value as "all" | "in" | "low" | "out")
                  }
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      isActive ? "text-white" : "text-ink dark:text-ink-dark"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-2 mb-2">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            Inventory list
          </Text>
        </View>

        <FlatList
          className="flex-1"
          data={inventoryList}
          keyExtractor={(item) => item.inventory_id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
          contentContainerClassName="pt-3 pb-32"
          ListEmptyComponent={
            isLoading ? (
              <View>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={`inventory-skeleton-${index}`}
                    className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <SkeletonBlock height={14} width={160} />
                        <SkeletonBlock height={12} width={120} className="mt-2" />
                        <SkeletonBlock height={12} width={90} className="mt-2" />
                      </View>
                      <View className="items-end">
                        <SkeletonBlock height={14} width={60} />
                        <SkeletonBlock height={20} width={80} className="mt-2" />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[13px] text-muted dark:text-muted-dark">
                No inventory items found.
              </Text>
            )
          }
          ListFooterComponent={
            !isLoading && inventoryList.length > 0 ? (
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
                    : "No more items"}
                </Text>
              </Pressable>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
