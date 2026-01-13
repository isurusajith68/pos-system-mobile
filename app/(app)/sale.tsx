import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  SalesInvoice,
  useSalesInvoicesQuery,
  useSalesSummaryQuery,
} from "../../src/services/invoices/queries";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(value);

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

export default function Sale() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const defaultEnd = useMemo(() => formatDateInput(today), [today]);
  const defaultStart = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return formatDateInput(start);
  }, [today]);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(defaultStart);
  const [toDate, setToDate] = useState(defaultEnd);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [page, setPage] = useState(1);
  const [invoiceList, setInvoiceList] = useState<SalesInvoice[]>([]);
  const limit = 20;

  const debouncedSearch = useMemo(() => search.trim(), [search]);
  const { data, isLoading, isFetching } = useSalesInvoicesQuery({
    page,
    limit,
    search: debouncedSearch,
    start: fromDate,
    end: toDate,
  });
  const { data: summaryData } = useSalesSummaryQuery({
    search: debouncedSearch,
    start: fromDate,
    end: toDate,
  });

  const invoices = data?.rows ?? [];
  const hasMore = invoices.length === limit;
  const summary = useMemo(
    () => ({
      count: summaryData?.bill_count ?? 0,
      total: summaryData?.total_amount ?? 0,
    }),
    [summaryData]
  );

  useEffect(() => {
    setPage(1);
    setInvoiceList([]);
  }, [debouncedSearch, fromDate, toDate]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setInvoiceList((prev) => {
      if (page === 1) {
        return data.rows;
      }
      const existing = new Set(prev.map((item) => item.invoice_id));
      const next = data.rows.filter((item) => !existing.has(item.invoice_id));
      return [...prev, ...next];
    });
  }, [data, page]);

  const renderInvoice = ({ item }: { item: SalesInvoice }) => (
    <Pressable
      onPress={() => router.push(`/sale/${item.invoice_id}`)}
      className="mb-3 rounded-2xl border border-line bg-card px-4 py-4 dark:border-line-dark dark:bg-card-dark"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">
            {item.invoice_id}
          </Text>
          <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
            {new Date(item.date).toLocaleString()}
          </Text>
          <View className="mt-2 flex-row">
            <View className="rounded-full bg-accent px-2.5 py-1 dark:bg-accent-dark">
              <Text className="text-[10px] font-semibold text-accent-ink dark:text-accent-ink-dark">
                {item.payment_status ?? "status"}
              </Text>
            </View>
            <View className="ml-2 rounded-full bg-card px-2.5 py-1 dark:bg-card-dark">
              <Text className="text-[10px] font-semibold text-muted dark:text-muted-dark">
                {item.payment_mode ?? "mode"}
              </Text>
            </View>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
            {formatCurrency(item.total_amount)}
          </Text>
          <Text className="mt-1 text-[12px] text-muted dark:text-muted-dark">
            Items {item.sales_details?.length ?? 0}
          </Text>
        </View>
      
      </View>
    </Pressable>
  );

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
                Sales
              </Text>
              <Text className="mt-1 text-[14px] text-muted dark:text-muted-dark">
                Review invoices by date range and number.
              </Text>
            </View>
            <Pressable
              className="ml-auto rounded-full bg-accent px-3 py-2 dark:bg-accent-dark"
              onPress={() => {
                queryClient.invalidateQueries({ queryKey: ["invoices"] });
              }}
            >
              <Text className="text-xs font-semibold text-accent-ink dark:text-accent-ink-dark">
                Refresh
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="mt-4">
          <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">
            Sales overview
          </Text>
          <View className="mt-3 flex-row">
            <View className="mr-3 flex-1 rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark">
              <Text className="text-[12px] text-muted dark:text-muted-dark">
                Total amount
              </Text>
              <Text className="mt-2 text-[20px] font-semibold text-ink dark:text-ink-dark">
                {formatCurrency(summary.total)}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl border border-line bg-accent px-4 py-4 dark:border-line-dark dark:bg-accent-dark">
              <Text className="text-[12px] text-muted dark:text-muted-dark">
                Bills
              </Text>
              <Text className="mt-2 text-[20px] font-semibold text-ink dark:text-ink-dark">
                {summary.count}
              </Text>
            </View>
          </View>
        </View>
        <View className="mt-5 flex-row items-center rounded-2xl border border-line bg-card px-3 py-1 dark:border-line-dark dark:bg-card-dark">
          <TextInput
            className="flex-1 text-[15px] text-ink dark:text-ink-dark"
            placeholder="Search invoice number"
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

        <View className="mt-4 flex-row">
          <View className="mr-3 flex-1 rounded-2xl border border-line bg-card px-3 py-2 dark:border-line-dark dark:bg-card-dark">
            <Text className="text-[11px] text-muted dark:text-muted-dark">
              From
            </Text>
            <Pressable className="mt-1" onPress={() => setShowFromPicker(true)}>
              <Text className="text-[13px] text-ink dark:text-ink-dark">
                {fromDate}
              </Text>
            </Pressable>
          </View>
          <View className="flex-1 rounded-2xl border border-line bg-card px-3 py-2 dark:border-line-dark dark:bg-card-dark">
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

        <View className="mt-4 mb-2">
          <Text className="text-[16px] font-semibold text-ink dark:text-ink-dark">
            Invoice list
          </Text>
        </View>

        <FlatList
          className="flex-1"
          data={invoiceList}
          keyExtractor={(item) => item.invoice_id}
          renderItem={renderInvoice}
          showsVerticalScrollIndicator={true}
          contentContainerClassName="pt-3 pb-32"
          ListEmptyComponent={
            isLoading ? (
              <Text className="text-[13px] text-muted dark:text-muted-dark">
                Loading invoices...
              </Text>
            ) : (
              <Text className="text-[13px] text-muted dark:text-muted-dark">
                No invoices found.
              </Text>
            )
          }
          ListFooterComponent={
            !isLoading && invoiceList.length > 0 ? (
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
                    : "No more invoices"}
                </Text>
              </Pressable>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
