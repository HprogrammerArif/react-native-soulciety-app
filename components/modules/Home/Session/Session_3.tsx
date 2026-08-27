import { useSession } from "@/hooks/useSession";
import { speak, stop } from "@/lib/elevenlabsTTS";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";

const EYES_OPEN_CLOSING_LINES = [
    "This exercise is complete. Take a moment to notice how you feel before continuing with your day.",
    "Pause for just a few seconds and appreciate showing up for yourself today.",
];

type SessionScreen3Props = {
  onBack: () => void;
  onContinue: () => void;
};

const SessionScreen_3: React.FC<SessionScreen3Props> = ({
  onBack,
  onContinue,
}) => {
  const [reflection, setReflection] = useState("");
  const { today, saveReflection, saveReflectionState } = useSession();

  const title = today.data?.theme?.theme_title || "Today Session";
  const mentalWorkout =
    today.data?.content?.mental_workout ||
    "Pause, breathe, and write what you are feeling right now without judging it.";
  const dayNumber = today.data?.day_number;

  const onSaveReflection = async () => {
    if (!dayNumber) {
      Alert.alert("Unavailable", "Could not identify today's day number.");
      return;
    }

    const trimmed = reflection.trim();
    if (!trimmed) {
      Alert.alert("Reflection required", "Please write your reflection first.");
      return;
    }

    try {
      await saveReflection({ dayNumber, mentalreflectiontext: trimmed });
      Alert.alert("Saved", "Your reflection has been saved.");

      // Play an eyes-open closing line before continuing
      const closingText = EYES_OPEN_CLOSING_LINES[
        Math.floor(Math.random() * EYES_OPEN_CLOSING_LINES.length)
      ];
      speak(closingText, {
        onDone: () => onContinue(),
        onError: () => onContinue(),
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save reflection.";
      Alert.alert("Save failed", message);
    }
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center px-6 pt-4">
          <SessionHeader title={title} onBackPress={onBack} />
        </View>

        <ScrollView
          className="mt-6 flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View className="mb-4">
            <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-[#C4943E]">
              Mental Workout
            </Text>
            <Text className="text-3xl font-medium text-gray-800">
              Inner Work Exercise
            </Text>
          </View>

          <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
            <Text className="mb-6 text-sm leading-6 text-gray-600">
              {mentalWorkout}
            </Text>

            <View className="min-h-[160px] rounded-2xl bg-[#F6F4F0] p-4">
              <TextInput
                placeholder="Type here..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
                value={reflection}
                onChangeText={setReflection}
                className="text-lg text-gray-800"
              />
            </View>

            <Text className="mt-4 text-center text-sm italic text-gray-400">
              Be honest. No one else sees this.
            </Text>
          </View>

          <View className="mb-6 gap-3">
            <TouchableOpacity
              className="items-center rounded-xl bg-[#FFD210] py-4"
              activeOpacity={0.8}
              onPress={onSaveReflection}
              disabled={saveReflectionState.isPending}
            >
              <Text className="text-lg font-bold text-black">
                {saveReflectionState.isPending
                  ? "Saving reflection..."
                  : "Save Reflection"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-xl border border-gray-200 bg-gray-50/50 py-4"
              activeOpacity={0.6}
              onPress={onContinue}
            >
              <Text className="text-lg font-semibold text-gray-600">
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SessionScreen_3;