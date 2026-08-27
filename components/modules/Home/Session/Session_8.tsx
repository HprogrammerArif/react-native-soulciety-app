import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import { useSession } from "@/hooks/useSession";
import { speak, stop } from "@/lib/elevenlabsTTS";
import { CompleteDayResponse } from "@/services/session.api";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";

const CLOSING_SIGNATURE_LINES = [
    "Remember… the peace you found here isn't leaving you. It's already within you. I'll see you in your next session.",
    "Carry this energy into every conversation, every decision, and every moment today. I'll be here whenever you need to reconnect.",
    "Your mind is becoming calmer. Your body is becoming lighter. Your soul already knows the way. Until next time.",
];

type SessionScreen8Props = {
  completionResult: CompleteDayResponse | null;
  onReturnHome: () => void;
  onViewJourneyMap: () => void;
};

export default function SessionScreen_8({
  completionResult,
  onReturnHome,
  onViewJourneyMap,
}: SessionScreen8Props) {
  const { progress, today } = useSession();
  const title = today.data?.theme?.theme_title || "Today Session";
  const streak = completionResult?.current_streak ?? progress.data?.current_streak ?? 0;
  const daysCompleted =
    completionResult?.total_days_completed ?? progress.data?.total_days_completed ?? 0;

  const hasPlayedSignature = useRef(false);

  // Auto-play the Soulciety closing signature when this screen mounts
  useEffect(() => {
    if (hasPlayedSignature.current) return;
    hasPlayedSignature.current = true;

    const text = CLOSING_SIGNATURE_LINES[
      Math.floor(Math.random() * CLOSING_SIGNATURE_LINES.length)
    ];
    speak(text, {
      onError: (err) => console.error("Closing signature TTS error:", err),
    });
  }, []);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => { stop(); };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <StatusBar style="dark" />

      <View className="px-5 pt-4">
        <SessionHeader title={title} onBackPress={onReturnHome} />
      </View>

      <View className="flex-1 px-5 pb-8 pt-10">
        <View className="items-center">
          <View className="h-28 w-28 items-center justify-center rounded-full bg-[#F6CF00]">
            <Text className="text-6xl">✨</Text>
          </View>

          <Text className="mt-8 text-6xl font-bold text-[#2E2E30]">Day Complete</Text>
          <Text className="mt-4 text-center text-2xl text-[#626264]">
            You showed up for yourself today.
          </Text>
        </View>

        <View className="mt-10 rounded-3xl bg-[#ECECEE] p-5">
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-2xl text-[#5C5C5E]">🔥  Current streak</Text>
            <Text className="text-4xl font-semibold text-[#3A3A3C]">{streak}</Text>
          </View>

          <View className="flex-row items-center justify-between py-2">
            <Text className="text-2xl text-[#5C5C5E]">🌿  Days completed</Text>
            <Text className="text-4xl font-semibold text-[#3A3A3C]">{daysCompleted}/30</Text>
          </View>

          <View className="flex-row items-center justify-between py-2">
            <Text className="text-2xl text-[#5C5C5E]">✨  Next session</Text>
            <Text className="text-2xl font-semibold text-[#6B6B6D]">Tomorrow</Text>
          </View>
        </View>

        <View className="mt-8 gap-4">
          <CustomPrimaryButton
            title="Return Home"
            onPress={onReturnHome}
            className="rounded-3xl bg-[#F6CF00]"
            textClassName="text-lg text-[#2D2D2D]"
          />

          <CustomPrimaryButton
            title="View Journey Map"
            onPress={onViewJourneyMap}
            className="rounded-3xl border border-[#D2D2D6] bg-transparent"
            textClassName="text-lg text-[#4E4E50]"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
