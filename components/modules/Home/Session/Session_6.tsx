import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import { useSession } from "@/hooks/useSession";
import { speak, stop } from "@/lib/elevenlabsTTS";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";

const EYES_OPEN_CLOSING_LINES = [
    "This exercise is complete. Take a moment to notice how you feel before continuing with your day.",
    "Pause for just a few seconds and appreciate showing up for yourself today.",
];

type SessionScreen6Props = {
  onBack: () => void;
  onContinue: () => void;
};

export default function SessionScreen_6({
  onBack,
  onContinue,
}: SessionScreen6Props) {
  const { today } = useSession();

  const title = today.data?.theme?.theme_title || "Today Session";
  const challengeText =
    today.data?.content?.mini_challenge ||
    "Do one small act of kindness for yourself today.";

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => { stop(); };
  }, []);

  const handleContinueWithClosing = useCallback(() => {
    const closingText = EYES_OPEN_CLOSING_LINES[
      Math.floor(Math.random() * EYES_OPEN_CLOSING_LINES.length)
    ];
    speak(closingText, {
      onDone: () => onContinue(),
      onError: () => onContinue(),
    });
  }, [onContinue]);

  if (today.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F5F5F5]">
        <ActivityIndicator size="large" color="#FFD210" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <StatusBar style="dark" />

      <View className="px-5 pt-4">
        <SessionHeader title={title} onBackPress={onBack} />
      </View>

      <View className="flex-1 px-5 pt-16">
        <View className="rounded-[34px] bg-[#ECECEE] px-6 py-10">
          <Text className="text-center text-xs font-medium uppercase tracking-widest text-[#C7A538]">
            Today&apos;s Soul Challenge
          </Text>

          <View className="my-8 items-center justify-center">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-[#EAE4D4]">
              <Text className="text-5xl">💛</Text>
            </View>
          </View>

          <Text className="text-center text-2xl leading-10 text-[#3D3D3F]">
            {challengeText}
          </Text>

          <CustomPrimaryButton
            title="I&apos;ll Do This"
            onPress={handleContinueWithClosing}
            className="mt-10 rounded-3xl bg-[#F6CF00]"
            textClassName="text-lg text-[#2D2D2D]"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
