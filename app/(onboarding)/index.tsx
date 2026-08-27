import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// SVGs
import MeditationSvg from "@/assets/images/onboarding-1.svg";
import YogaSvg from "@/assets/images/onboarding-2.svg";
import RelaxSvg from "@/assets/images/onboarding-3.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const onboardingData = [
  {
    id: 1,
    title: "Welcome to\nSoulciety",
    subtitle: "Your journey to inner peace and higher consciousness begins here.",
    Svg: MeditationSvg,
    skip: true, // show Skip + Arrow
  },
  {
    id: 2,
    title: "Your Personal\nSpiritual Guide",
    subtitle: "An AI friend that understands you — helping you feel better every day.",
    Svg: YogaSvg,
    skip: true, // show Skip + Arrow
  },
  {
    id: 3,
    title: "You’re Not Alone",
    subtitle: "Join a conscious community where souls uplift each other.",
    Svg: RelaxSvg,
    skip: false, // hide Skip, show Get Started
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const currentItem = onboardingData[currentIndex];

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem("onboarding", "true")
      router.replace("/(auth)/login")
    } catch (error) {
      console.log(error)
    }
  }

  const goNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Skip button based on skip property */}
      {currentItem.skip && (
        <View className="flex-row justify-end px-5 mt-2">
          <TouchableOpacity onPress={handleStart}>
            <Text className="font-semibold text-sm">Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Screen content (no swipe, just current item) */}
      <View className="flex-1 px-5 items-center justify-center gap-10">
        <View className="mt-10">
          <currentItem.Svg width={350} height={260} />
        </View>

        {/* Pagination */}
        <View className="flex-row justify-center gap-1 mt-6">
          {onboardingData.map((_, i) => (
            <View
              key={i}
              className={`h-2 rounded-full ${i === currentIndex ? "w-4 bg-yellow-400" : "w-2 bg-gray-300"
                }`}
            />
          ))}
        </View>

        {/* Title & Subtitle */}
        <View className="mt-10 w-full">
          <Text className="text-3xl font-semibold text-gray-900">
            {currentItem.title}
          </Text>

          <Text className="text-gray-500 mt-3 leading-6">
            {currentItem.subtitle}
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          right: 32,
        }}
      >
        {!currentItem.skip ? (
          <TouchableOpacity
            onPress={handleStart}
            className="bg-yellow-400 px-7 py-3 rounded-full"
          >
            <Text className="text-white text-lg font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={goNext}
            className="w-14 h-14 rounded-full bg-yellow-400 items-center justify-center"
          >
            <ArrowRight size={26} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
