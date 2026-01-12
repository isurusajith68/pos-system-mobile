import { Redirect, Slot } from "expo-router";
import SplashScreen from "../../components/SplashScreen";
import { useAuth } from "../../src/context/AuthContext";

export default function AuthLayout() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <SplashScreen />;
  }

  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return <Slot />;
}
