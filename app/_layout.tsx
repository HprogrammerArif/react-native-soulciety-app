import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import "../global.css";

import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import {
  AbhayaLibre_600SemiBold,
} from "@expo-google-fonts/abhaya-libre";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  View,
} from "react-native";

SplashScreen.preventAutoHideAsync();

// Create QueryClient once
const queryClient = new QueryClient();

// Custom toast configuration
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#10B981",
        borderLeftWidth: 6,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderRadius: 16,
        minHeight: 60,
        height: "auto",
        width: "90%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.1)",
        paddingVertical: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontFamily: "Poppins_600SemiBold",
        color: "#111827",
      }}
      text2Style={{
        fontSize: 12,
        fontFamily: "Poppins_400Regular",
        color: "#6B7280",
      }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: "center", alignItems: "center", marginLeft: 15 }}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        borderLeftWidth: 6,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderRadius: 16,
        minHeight: 70,
        height: "auto",
        width: "90%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.1)",
        paddingVertical: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontFamily: "Poppins_600SemiBold",
        color: "#111827",
      }}
      text2Style={{
        fontSize: 12,
        fontFamily: "Poppins_400Regular",
        color: "#6B7280",
      }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: "center", alignItems: "center", marginLeft: 15 }}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
        </View>
      )}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#3B82F6",
        borderLeftWidth: 6,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderRadius: 16,
        minHeight: 70,
        height: "auto",
        width: "90%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.1)",
        paddingVertical: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontFamily: "Poppins_600SemiBold",
        color: "#111827",
      }}
      text2Style={{
        fontSize: 12,
        fontFamily: "Poppins_400Regular",
        color: "#6B7280",
      }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: "center", alignItems: "center", marginLeft: 15 }}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
        </View>
      )}
    />
  ),
};

export default function RootLayout() {
  const [animationDone, setAnimationDone] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    AbhayaLibre_600SemiBold,
  });

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const runAnimation = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(200),

      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setAnimationDone(true);
      }, 500);
    });
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      runAnimation();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // Splash Screen
  if (!animationDone) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Animated.Text
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            fontSize: 48,
            fontFamily: "AbhayaLibre_600SemiBold",
            color: "#000",
            letterSpacing: 1,
          }}
        >
          Soulciety
        </Animated.Text>

        <Animated.Text
          style={{
            opacity: textOpacity,
            marginTop: 8,
            fontSize: 14,
            fontFamily: "Poppins_400Regular",
            color: "#666",
            letterSpacing: 2,
          }}
        >
          CONNECT • SHARE • GROW
        </Animated.Text>
      </View>
    );
  }

  // Main App
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
            />

            <Stack screenOptions={{ headerShown: false }} />

            <Toast config={toastConfig} />
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}