import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRecentInvoicesQuery } from "../services/invoices/queries";
import { useDailyInvoiceStatsQuery } from "../services/invoices/stats";
import { useUserMeQuery } from "../services/users/queries";

const quickActions = [
  { title: "New\nSale", icon: "receipt", route: "/sale" },
  { title: "Products", icon: "tag", route: "/products" },
  { title: "Inventory", icon: "box", route: "/inventory" },
  { title: "PO", icon: "doc", route: "/purchase-order" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(value);

function ActionIcon({ type }: { type: string }) {
  if (type === "receipt") {
    return (
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F3EEE5] dark:bg-[#2A2E2B]">
        <View className="h-4 w-5 rounded-sm border border-[#4D4A44] dark:border-[#C9C2B8]">
          <View className="mt-1 h-0.5 w-3 self-center bg-[#4D4A44] dark:bg-[#C9C2B8]" />
          <View className="mt-1 h-0.5 w-2 self-center bg-[#4D4A44] dark:bg-[#C9C2B8]" />
        </View>
      </View>
    );
  }

  if (type === "tag") {
    return (
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F3EEE5] dark:bg-[#2A2E2B]">
        <View className="h-4 w-6 rounded-md border border-[#4D4A44] dark:border-[#C9C2B8]">
          <View className="ml-1 mt-1 h-1.5 w-1.5 rounded-full bg-[#4D4A44] dark:bg-[#C9C2B8]" />
        </View>
      </View>
    );
  }

  if (type === "box") {
    return (
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F3EEE5] dark:bg-[#2A2E2B]">
        <View className="h-5 w-5 rounded border border-[#4D4A44] dark:border-[#C9C2B8]">
          <View className="h-0.5 w-5 bg-[#4D4A44] dark:bg-[#C9C2B8]" />
        </View>
      </View>
    );
  }

  if (type === "doc") {
    return (
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F3EEE5] dark:bg-[#2A2E2B]">
        <View className="h-5 w-4 rounded-sm border border-[#4D4A44] dark:border-[#C9C2B8]">
          <View className="mt-1 h-0.5 w-3 self-center bg-[#4D4A44] dark:bg-[#C9C2B8]" />
          <View className="mt-1 h-0.5 w-2 self-center bg-[#4D4A44] dark:bg-[#C9C2B8]" />
        </View>
      </View>
    );
  }

  return (
    <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#F3EEE5] dark:bg-[#2A2E2B]">
      <View className="flex-row items-end">
        <View className="h-3 w-1.5 rounded-sm bg-[#4D4A44] dark:bg-[#C9C2B8]" />
        <View className="ml-1 h-4 w-1.5 rounded-sm bg-[#4D4A44] dark:bg-[#C9C2B8]" />
        <View className="ml-1 h-5 w-1.5 rounded-sm bg-[#4D4A44] dark:bg-[#C9C2B8]" />
      </View>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { data: me } = useUserMeQuery();
  const { user } = useAuth();
  const { data: recentInvoices = [] } = useRecentInvoicesQuery();
  const { data: dailyStats } = useDailyInvoiceStatsQuery();

  return (
    <SafeAreaView className="flex-1 bg-[#FBF7F0] dark:bg-[#0F1110]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[13px] text-[#6B6257] dark:text-[#A79B8B]">
              Welcome back
            </Text>
            <Text className="mt-1 text-[24px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
              {me?.name ?? "Welcome"}
            </Text>
          </View>
          <View className="rounded-full bg-[#111827] px-4 py-2 dark:bg-[#F5F1EA]">
            <Text className="text-xs font-semibold text-[#F4F1EA] dark:text-[#1E1B16]">
              {user?.storeName ?? "Store"}
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-[26px] bg-[#c7a052] p-5 overflow-hidden dark:bg-[#1A1B1A]">
          <View className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#F4D79B] dark:bg-[#5B4A1D]" />
          <Text className="text-[13px] text-[#6B6257] dark:text-[#A79B8B]">
            Today sales
          </Text>
          <Text className="mt-2 text-[28px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
            {dailyStats ? formatCurrency(dailyStats.total_amount) : "--"}
          </Text>
          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-1 rounded-2xl bg-white px-4 py-3 dark:bg-[#1F2321]">
              <Text className="text-[12px] text-[#6B6257] dark:text-[#A79B8B]">
                Transactions
              </Text>
              <Text className="mt-1 text-[18px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
                {dailyStats?.invoice_count ?? "--"}
              </Text>
            </View>
            <View className="mx-3 flex-1 rounded-2xl bg-white px-4 py-3 dark:bg-[#1F2321]">
              <Text className="text-[12px] text-[#6B6257] dark:text-[#A79B8B]">
                Avg ticket
              </Text>
              <Text className="mt-1 text-[18px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
                {dailyStats
                  ? formatCurrency(
                      dailyStats.total_amount /
                        Math.max(dailyStats.invoice_count, 1),
                    )
                  : "--"}
              </Text>
            </View>
          </View>
          <View className="absolute right-4 top-5 rounded-full bg-[#816B2C] px-3 py-1 dark:bg-[#3F3416]">
            <Text className="text-xs font-semibold text-[#F4E9C7] dark:text-[#F3E6BE]">
              +12%
            </Text>
          </View>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-[16px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
            Quick actions
          </Text>
          <View className="rounded-full bg-[#E4F1EC] px-3 py-1 dark:bg-[#1F2E2A]">
            <Text className="text-xs font-semibold text-[#1F6C55] dark:text-[#8DDAC6]">
              Live
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap justify-between">
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              className="mb-4 w-[30%] rounded-2xl border border-[#E3D7C7] bg-white px-4 py-5 dark:border-[#2B2F2C] dark:bg-[#1F2321]"
              onPress={() => router.push(action.route)}
            >
              <ActionIcon type={action.icon} />
              <Text className="mt-3 text-[13px] text-[#6B6257] dark:text-[#A79B8B]">
                {action.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-1 border-t border-[#E6DBC9] pt-5 dark:border-[#2B2F2C]">
          <Text className="text-[16px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
            Recent sales
          </Text>
          <View className="mt-4">
            {recentInvoices.map((invoice) => (
              <View
                key={invoice.invoice_id}
                className="mb-3 rounded-2xl border border-[#E3D7C7] bg-white px-4 py-4 dark:border-[#2B2F2C] dark:bg-[#1F2321]"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-[14px] font-semibold text-[#1E1B16] dark:text-[#F5F1EA]">
                    {invoice.invoice_id}
                  </Text>
                  <Text className="text-[14px] font-semibold text-[#F97316] dark:text-[#F59E0B]">
                    {formatCurrency(invoice.total_amount)}
                  </Text>
                </View>
                <Text className="mt-2 text-[12px] text-[#6B6257] dark:text-[#A79B8B]">
                  {new Date(invoice.date).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
