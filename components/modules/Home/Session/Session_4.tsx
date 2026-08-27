import { useSession } from "@/hooks/useSession";
import { speak, stop } from "@/lib/elevenlabsTTS";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";

type SessionScreen4Props = {
  onBack: () => void;
  onContinue: () => void;
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const SessionScreen_4: React.FC<SessionScreen4Props> = ({
  onBack,
  onContinue,
}) => {
  const { today } = useSession();
  const durationSeconds = today.data?.content?.physical_workout?.duration_seconds || 120;
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const hasPlayedReminder = useRef(false);

  const title = today.data?.theme?.theme_title || "Today Session";
  const workoutTitle =
    today.data?.content?.physical_workout?.title || "Body Release Practice";
  const workoutInstructions =
    today.data?.content?.physical_workout?.instructions ||
    "Follow this practice gently and stay present with your breath.";

  useEffect(() => {
    setSecondsLeft(durationSeconds);
    hasPlayedReminder.current = false;
  }, [durationSeconds]);

  // Gentle reminder TTS when timer reaches ~15 seconds
  useEffect(() => {
    if (!isRunning || hasPlayedReminder.current) return;
    if (secondsLeft <= 15 && secondsLeft > 0) {
      hasPlayedReminder.current = true;
      const reminders = [
        "You're doing beautifully. Just a few more breaths.",
        "Allow yourself to soak in this feeling for a few more moments.",
      ];
      const text = reminders[Math.floor(Math.random() * reminders.length)];
      speak(text, {
        onError: (err) => console.error("Timer reminder TTS error:", err),
      });
    }
  }, [isRunning, secondsLeft]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => { stop(); };
  }, []);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setIsRunning(false);
    }
  }, [secondsLeft]);

  const primaryButtonLabel = useMemo(() => {
    if (secondsLeft === 0) {
      return "Continue";
    }
    if (isRunning) {
      return "Pause Practice";
    }
    if (secondsLeft !== durationSeconds) {
      return "Resume Practice";
    }
    return "Start Practice";
  }, [durationSeconds, isRunning, secondsLeft]);

  const helperText = useMemo(() => {
    if (secondsLeft === 0) {
      return "Practice complete. Finish your day when ready.";
    }
    if (isRunning) {
      return "Stay with your breath and keep going.";
    }
    return "Tap start when ready";
  }, [isRunning, secondsLeft]);

  const onPressPrimary = async () => {
    if (secondsLeft === 0) {
      onContinue();
      return;
    }

    setIsRunning((prev) => !prev);
  };

  const onRestart = () => {
    setIsRunning(false);
    setSecondsLeft(durationSeconds);
  };

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

      <View className="flex-row items-center px-6 pt-4">
        <SessionHeader title={title} onBackPress={onBack} />
      </View>

      <ScrollView
        className="mt-8 flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mb-6 items-center">
          <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C4943E]">
            Physical Exercise
          </Text>
          <Text className="text-center text-3xl font-normal text-gray-700">
            {workoutTitle}
          </Text>
        </View>

        <Text className="mb-10 px-2 text-center text-sm leading-6 text-gray-600">
          {workoutInstructions}
        </Text>

        <View className="mb-6 items-center justify-center">
          <View
            className="h-48 w-48 items-center justify-center rounded-full bg-[#EFEBE0]"
            style={{ elevation: 1 }}
          >
            <View className="h-28 w-28 items-center justify-center rounded-full bg-white shadow-sm">
              <Text style={{ fontSize: 40 }}>🧘</Text>
            </View>
          </View>
        </View>

        <View className="mb-10 items-center">
          <Text className="text-6xl font-light tracking-tighter text-gray-800">
            {formatTime(secondsLeft)}
          </Text>
          <Text className="mt-2 text-sm text-gray-500">{helperText}</Text>
        </View>

      </ScrollView>

      <View className="px-6 pb-8">
        {secondsLeft !== durationSeconds && secondsLeft !== 0 ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 items-center rounded-2xl bg-[#FFD210] py-4 shadow-sm"
              activeOpacity={0.9}
              onPress={onPressPrimary}
            >
              <Text className="text-lg font-semibold text-black">
                {primaryButtonLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 items-center rounded-2xl border border-gray-200 bg-white py-4"
              activeOpacity={0.8}
              onPress={onRestart}
            >
              <Text className="text-lg font-semibold text-gray-700">Restart Practice</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="items-center rounded-2xl bg-[#FFD210] py-4 shadow-sm"
            activeOpacity={0.9}
            onPress={onPressPrimary}
            >
              <Text className="text-lg font-semibold text-black">{primaryButtonLabel}</Text>
            </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SessionScreen_4;