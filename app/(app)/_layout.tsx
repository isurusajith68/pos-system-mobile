import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

export default function AppLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#F5F1EA" : "#1E1B16",
        tabBarInactiveTintColor: isDark ? "#A79B8B" : "#6B6257",
        tabBarLabelStyle: { fontSize: 10, marginBottom: 8 },
        tabBarIconStyle: { marginTop: 8 },
        tabBarStyle: {
          position: "absolute",
          left: 24,
          right: 24,
          // bottom: 16,
          height: 64,
          borderRadius: 20,
          backgroundColor: isDark ? "#1B1E1C" : "#FFFFFF",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? "#2B2F2C" : "#E3D7C7",
          shadowColor: "#000000",
          shadowOpacity: isDark ? 0.28 : 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: isDark ? 12 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="sale" options={{ href: null }} />
      <Tabs.Screen name="inventory" options={{ href: null }} />
      <Tabs.Screen name="purchase-order" options={{ href: null }} />
    </Tabs>
  );
}
