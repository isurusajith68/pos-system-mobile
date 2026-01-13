import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCategoriesQuery } from "../../src/services/categories/queries";
import {
  Product,
  useProductsQuery,
  useProductStatsQuery,
} from "../../src/services/products/queries";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value);

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

export default function Products() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(10);
  const [stockFilter, setStockFilter] = useState<
    "all" | "in" | "low" | "out"
  >("all");
  const [page, setPage] = useState(1);
  const [productList, setProductList] = useState<Product[]>([]);
  const limit = 20;

  const debouncedSearch = useMemo(() => search.trim(), [search]);
  const { data: categories = [] } = useCategoriesQuery();
  const { data: stats } = useProductStatsQuery(threshold);
  const { data, isLoading, isFetching } = useProductsQuery({
    page,
    limit,
    search: debouncedSearch,
    categoryId,
    stockFilter,
    threshold,
  });

  const products = data?.rows ?? [];
  const hasMore = products.length === limit;

  useEffect(() => {
    setPage(1);
    setProductList([]);
  }, [debouncedSearch, categoryId, stockFilter, threshold]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setProductList((prev) => {
      if (page === 1) {
        return data.rows;
      }
      const existing = new Set(prev.map((item) => item.product_id));
      const next = data.rows.filter((item) => !existing.has(item.product_id));
      return [...prev, ...next];
    });
  }, [data, page]);

  const renderProduct = ({ item }: { item: Product }) => {
    const stock = item.stock_level ?? 0;
    const isLowStock = stock > 0 && stock <= threshold;
    const isOut = stock <= 0;
    const price =
      typeof item.price === "number" ? formatCurrency(item.price) : "--";

    return (
      <Pressable
        onPress={() => router.push(`/products/${item.product_id}`)}
        className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">
              {item.name}
            </Text>
            <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
              {item.category_name ?? "Uncategorized"}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
              {price}
            </Text>
            <View
              className={`mt-2 rounded-full px-2.5 py-1 ${
                isOut
                  ? "bg-[#FCEAEA] dark:bg-[#2B1B1B]"
                  : isLowStock
                    ? "bg-[#FFF4EC] dark:bg-[#241B16]"
                    : "bg-accent dark:bg-accent-dark"
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  isOut
                    ? "text-[#9B2C2C] dark:text-[#F29B9B]"
                    : isLowStock
                      ? "text-[#8B3A1A] dark:text-[#F2B397]"
                      : "text-accent-ink dark:text-accent-ink-dark"
                }`}
              >
                {isOut ? "Out of stock" : `Stock ${stock}`}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6">
        <View className="mt-4">
          <View className="flex-row items-center">
            <Pressable
              className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-line bg-card dark:border-line-dark dark:bg-card-dark"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                  return;
                }
                router.replace("/dashboard");
              }}
            >
              <Text className="text-[18px] text-ink dark:text-ink-dark">←</Text>
            </Pressable>
            <View>
              <Text className="text-[22px] font-semibold text-ink dark:text-ink-dark">
                Products
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Manage items, pricing, and categories.
              </Text>
            </View>
            <Pressable
              className="ml-auto rounded-full bg-accent px-3 py-2 dark:bg-accent-dark"
              onPress={() => {
                queryClient.invalidateQueries({ queryKey: ["products"] });
                queryClient.invalidateQueries({ queryKey: ["categories"] });
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
              { label: "Total", value: stats?.total ?? "--" },
              { label: "In stock", value: stats?.in_stock ?? "--" },
              { label: "Low stock", value: stats?.low_stock ?? "--" },
              { label: "Out", value: stats?.out_of_stock ?? "--" },
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

        <View className="mt-2 flex-row items-center rounded-2xl border border-line bg-card px-3 py-1 dark:border-line-dark dark:bg-card-dark">
          <TextInput
            className="flex-1 text-[15px] text-ink dark:text-ink-dark"
            placeholder="Search products"
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

        <View className="mt-4">
          <Text className="text-[12px] text-muted dark:text-muted-dark">
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            className="mt-2"
          >
            <Pressable
              className={`mr-2 rounded-full border px-4 py-2 ${
                !categoryId
                  ? "border-transparent bg-primary dark:bg-primary-dark"
                  : "border-line bg-card dark:border-line-dark dark:bg-card-dark"
              }`}
              onPress={() => setCategoryId(null)}
            >
              <Text
                className={`text-[12px] font-semibold ${
                  !categoryId ? "text-white" : "text-ink dark:text-ink-dark"
                }`}
              >
                All
              </Text>
            </Pressable>
            {categories.map((category) => {
              const isActive = categoryId === category.category_id;
              return (
                <Pressable
                  key={category.category_id}
                  className={`mr-2 rounded-full border px-4 py-2 ${
                    isActive
                      ? "border-transparent bg-primary dark:bg-primary-dark"
                      : "border-line bg-card dark:border-line-dark dark:bg-card-dark"
                  }`}
                  onPress={() =>
                    setCategoryId(isActive ? null : category.category_id)
                  }
                >
                  <Text
                    className={`text-[12px] font-semibold ${
                      isActive ? "text-white" : "text-ink dark:text-ink-dark"
                    }`}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="mt-2 mb-2">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            Product list
          </Text>
        </View>

        <FlatList
          className="flex-1"
          data={productList}
          keyExtractor={(item) => item.product_id}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={true}
          contentContainerClassName="pt-3 pb-32"
          ListEmptyComponent={
            isLoading ? (
              <View>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View
                    key={`skeleton-${index}`}
                    className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <SkeletonBlock height={14} width={160} />
                        <SkeletonBlock
                          height={12}
                          width={110}
                          className="mt-2"
                        />
                      </View>
                      <View className="items-end">
                        <SkeletonBlock height={14} width={70} />
                        <SkeletonBlock
                          height={20}
                          width={80}
                          className="mt-2"
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[13px] text-muted dark:text-muted-dark">
                No products found.
              </Text>
            )
          }
          ListFooterComponent={
            !isLoading && productList.length > 0 ? (
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
                    : "No more products"}
                </Text>
              </Pressable>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
