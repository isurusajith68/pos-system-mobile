import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import AnimatedTabBarButton from "../../components/AnimatedTabBarButton";
import { useAuth } from "../../src/context/AuthContext";
import { colors } from "../../src/theme/colors";

export default function AppLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
        tabBarActiveTintColor: isDark ? colors.inkDark : colors.ink,
        tabBarInactiveTintColor: isDark ? colors.mutedDark : colors.muted,
        tabBarLabelStyle: { fontSize: 10, marginBottom: 8 },
        tabBarIconStyle: { marginTop: 8 },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 24,
          right: 24,
          // bottom: 16,
          height: 64,
          borderRadius: 20,
          backgroundColor: isDark ? colors.cardDark : colors.card,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? colors.lineDark : colors.line,
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
      <Tabs.Screen name="products/[id]" options={{ href: null }} />
    </Tabs>
  );
}
