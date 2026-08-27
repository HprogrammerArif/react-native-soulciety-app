import { useMood } from "@/hooks/useMood";
import { useUser } from "@/hooks/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function App() {
  const { profile, isCheckingAuth } = useUser();
  const { moodKey, loading: moodLoading } = useMood();
  const [onboarding, setOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchOnboarding = async () => {
      const value = await AsyncStorage.getItem("onboarding");
      setOnboarding(value === "true");
    };
    fetchOnboarding();
  }, []);

  // ⏳ Wait for onboarding check
  if (onboarding === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  // 🟡 Onboarding not done
  if (onboarding === false) {
    return <Redirect href="/(onboarding)" />;
  }

  // ⏳ Wait for auth bootstrap
  if (isCheckingAuth || (profile.isLoading && profile.fetchStatus !== 'idle')) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  // ✅ Logged in
  if (profile.data) {
    // ⏳ Wait for mood to load before deciding where to send them
    if (moodLoading) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator />
        </View>
      );
    }

    // 🟠 No mood set for today → keep them on the welcome (mood) screen
    if (!moodKey) {
      return <Redirect href="/(welcome)" />;
    }

    return <Redirect href="/(tabs)" />;
  }

  // ❌ Not logged in
  return <Redirect href="/(auth)/login" />;
}
