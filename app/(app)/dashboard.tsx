import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Animated, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useRecentInvoicesQuery } from "../../src/services/invoices/queries";
import { useDailyInvoiceStatsQuery } from "../../src/services/invoices/stats";
import { useUserMeQuery } from "../../src/services/users/queries";

const quickActions = [
  { title: "Sales", icon: "receipt", route: "/sale" },
  { title: "Products", icon: "tag", route: "/products" },
  { title: "Inventory", icon: "box", route: "/inventory" },
  { title: "PO", icon: "doc", route: "/purchase-order" },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value);

function ActionIcon({ type }: { type: string }) {
  const base =
    "h-9 w-9 items-center justify-center rounded-xl bg-accent dark:bg-accent-dark";
  const line = "bg-accent-ink dark:bg-accent-ink-dark";

  if (type === "receipt")
    return (
      <View className={base}>
        <View className="h-4 w-5 rounded-sm border border-accent-ink dark:border-accent-ink-dark">
          <View className={`mt-1 h-0.5 w-3 self-center ${line}`} />
          <View className={`mt-1 h-0.5 w-2 self-center ${line}`} />
        </View>
      </View>
    );

  if (type === "tag")
    return (
      <View className={base}>
        <View className="h-4 w-6 rounded-md border border-accent-ink dark:border-accent-ink-dark">
          <View className={`ml-1 mt-1 h-1.5 w-1.5 rounded-full ${line}`} />
        </View>
      </View>
    );

  if (type === "box")
    return (
      <View className={base}>
        <View className="h-5 w-5 rounded border border-accent-ink dark:border-accent-ink-dark">
          <View className={`h-0.5 w-5 ${line}`} />
        </View>
      </View>
    );

  if (type === "doc")
    return (
      <View className={base}>
        <View className="h-5 w-4 rounded-sm border border-accent-ink dark:border-accent-ink-dark">
          <View className={`mt-1 h-0.5 w-3 self-center ${line}`} />
          <View className={`mt-1 h-0.5 w-2 self-center ${line}`} />
        </View>
      </View>
    );

  return null;
}
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

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me, isLoading: isUserLoading } = useUserMeQuery();
  const { user } = useAuth();
  const { data: recentInvoices = [], isLoading: isRecentLoading } =
    useRecentInvoicesQuery();
  const { data: dailyStats, isLoading: isStatsLoading } =
    useDailyInvoiceStatsQuery();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["users", "me"] });
  };

  const recentListData = isRecentLoading
    ? Array.from({ length: 6 }).map((_, index) => ({
        placeholder: true,
        id: `placeholder-${index}`,
      }))
    : recentInvoices;

  return (
    <SafeAreaView className="flex-1 bg-base dark:bg-base-dark">
      <View className="flex-1 px-6">
        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[13px] text-muted dark:text-muted-dark">
              Welcome back
            </Text>
            {isUserLoading ? (
              <SkeletonBlock height={24} width={160} className="mt-2" />
            ) : (
              <Text className="mt-1 text-[24px] font-semibold text-ink dark:text-ink-dark">
                {me?.name ?? "Welcome"}
              </Text>
            )}
          </View>
          <View className="flex-row items-center">
            <Pressable
              className="mr-2 rounded-full bg-accent px-3 py-2 dark:bg-accent-dark"
              onPress={handleRefresh}
            >
              <Text className="text-xs font-semibold text-accent-ink dark:text-accent-ink-dark">
                Refresh
              </Text>
            </Pressable>
            <View className="rounded-full bg-[#111827] px-4 py-2 dark:bg-[#F5F1EA]">
              <Text className="text-xs font-semibold text-[#F4F1EA] dark:text-[#1E1B16]">
                {user?.storeName ?? "Store"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 rounded-[26px] bg-[#408b84] p-5 overflow-hidden dark:bg-[#1A1B1A]">
          <View className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#0B6A63] dark:bg-[#1F2E2A]" />
          <Text className="text-[13px] text-white dark:text-muted-dark">
            Today sales
          </Text>
          {isStatsLoading ? (
            <SkeletonBlock height={28} width={180} className="mt-2" />
          ) : (
            <Text className="mt-2 text-[28px] font-semibold text-white dark:text-ink-dark">
              {dailyStats ? formatCurrency(dailyStats.total_amount) : "--"}
            </Text>
          )}
          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-1 rounded-2xl bg-card px-4 py-3 dark:bg-card-dark">
              <Text className="text-[12px] text-muted dark:text-muted-dark">
                Transactions
              </Text>
              {isStatsLoading ? (
                <SkeletonBlock height={18} width={60} className="mt-2" />
              ) : (
                <Text className="mt-1 text-[18px] font-semibold text-ink dark:text-ink-dark">
                  {dailyStats?.invoice_count ?? "--"}
                </Text>
              )}
            </View>
            <View className="mx-3 flex-1 rounded-2xl bg-card px-4 py-3 dark:bg-card-dark">
              <Text className="text-[12px] text-muted dark:text-muted-dark">
                Avg ticket
              </Text>
              {isStatsLoading ? (
                <SkeletonBlock height={18} width={90} className="mt-2" />
              ) : (
                <Text className="mt-1 text-[18px] font-semibold text-ink dark:text-ink-dark">
                  {dailyStats
                    ? formatCurrency(
                        dailyStats.total_amount /
                          Math.max(dailyStats.invoice_count, 1)
                      )
                    : "--"}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            Quick actions
          </Text>
          <View className="rounded-full bg-accent px-3 py-1 dark:bg-accent-dark">
            <Text className="text-xs font-semibold text-accent-ink dark:text-accent-ink-dark">
              Live
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap justify-between">
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              onPress={() => router.push(action.route)}
              className="mb-4 w-[24%] rounded-2xl bg-card px-4 py-5 items-center shadow-sm dark:bg-[#1A1B1A]"
            >
              <ActionIcon type={action.icon} />
              <Text className="mt-3 text-[13px] font-medium text-ink text-center dark:text-white">
                {action.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-1 flex-1 border-t border-line pt-5 dark:border-line-dark">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            Recent sales
          </Text>
          <FlatList
            className="mt-4"
            data={recentListData}
            keyExtractor={(item) =>
              "placeholder" in item ? item.id : item.invoice_id
            }
            showsVerticalScrollIndicator={true}
            contentContainerClassName="pb-32"
            renderItem={({ item }) =>
              "placeholder" in item ? (
                <View className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
                  <View className="flex-row items-center justify-between">
                    <SkeletonBlock height={14} width={90} />
                    <SkeletonBlock height={14} width={70} />
                  </View>
                  <SkeletonBlock height={12} width={140} className="mt-3" />
                </View>
              ) : (
                <View className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
                      {item.invoice_id}
                    </Text>
                    <Text className="text-[14px] font-semibold text-[#F97316] dark:text-[#F59E0B]">
                      {formatCurrency(item.total_amount)}
                    </Text>
                  </View>
                  <Text className="mt-2 text-[12px] text-muted dark:text-muted-dark">
                    {new Date(item.date).toLocaleString()}
                  </Text>
                </View>
              )
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
