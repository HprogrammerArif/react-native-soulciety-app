import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import { useSession } from "@/hooks/useSession";
import { CompleteDayResponse } from "@/services/session.api";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";

type SessionScreen7Props = {
  onBack: () => void;
  onComplete: (result: CompleteDayResponse) => void;
};

type MoodItem = {
  key: "happy" | "sad" | "fear" | "angry" | "sick";
  label: string;
};

const moodOptions: MoodItem[] = [
  { key: "happy", label: "😊peaceful" },
  { key: "sad", label: "😔heavy" },
  { key: "fear", label: "😟tense" },
  { key: "happy", label: "🌿hopeful" },
  { key: "angry", label: "😰anxious" },
];

export default function SessionScreen_7({ onBack, onComplete }: SessionScreen7Props) {
  const { today, createJournalEntry, createJournalEntryState, completeDay, completeDayState } =
    useSession();

  const [journalText, setJournalText] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodItem["key"] | null>(null);

  const title = today.data?.theme?.theme_title || "Today Session";
  const dayNumber = today.data?.day_number;
  const journalPrompt = today.data?.content?.journal_prompt || "Reflect and release.";

  const isSubmitting = createJournalEntryState.isPending || completeDayState.isPending;

  const onPressComplete = async () => {
    if (!dayNumber) {
      Alert.alert("Unavailable", "Could not identify today's day number.");
      return;
    }

    const trimmedJournal = journalText.trim();
    if (!trimmedJournal) {
      Alert.alert("Journal required", "Please write your journal response.");
      return;
    }

    if (!selectedMood) {
      Alert.alert("Mood required", "Please select how you are feeling right now.");
      return;
    }

    try {
      const journalEntry = await createJournalEntry({
        content: trimmedJournal,
        mode: "healing_journey",
        tag: `day_${dayNumber}_journal`,
      });

      const result = await completeDay({
        dayNumber,
        payload: {
          mood: selectedMood,
          journal_entry_id: journalEntry.id,
        },
      });

      onComplete(result);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to complete today's journey.";
      Alert.alert("Submission failed", message);
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

      <View className="px-5 pt-4">
        <SessionHeader title={title} onBackPress={onBack} />
      </View>

      <ScrollView
        className="mt-8 flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text className="text-xs font-medium uppercase tracking-widest text-[#C7A538]">
          Journal Prompt
        </Text>
        <Text className="mt-2 text-5xl font-medium text-[#2F2F31]">Reflect and Release</Text>

        <View className="mt-6 rounded-3xl bg-[#ECECEE] p-4">
          <Text className="text-xl text-[#3B3B3D]">{journalPrompt}</Text>
          <View className="mt-4 min-h-[180px] rounded-3xl bg-[#E5E4E1] p-4">
            <TextInput
              placeholder="Write freely..."
              placeholderTextColor="#9A9A9D"
              multiline
              textAlignVertical="top"
              value={journalText}
              onChangeText={setJournalText}
              className="text-lg text-[#333335]"
            />
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-[#ECECEE] p-5">
          <Text className="text-5xl font-medium text-[#2F2F31]">How are you feeling right now?</Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            {moodOptions.map((mood, index) => {
              const isSelected = selectedMood === mood.key;

              return (
                <TouchableOpacity
                  key={`${mood.label}-${index}`}
                  onPress={() => setSelectedMood(mood.key)}
                  className={`rounded-full border px-5 py-3 ${
                    isSelected
                      ? "border-[#F4C500] bg-[#FFF5CC]"
                      : "border-[#D6D6DA] bg-[#F7F7F8]"
                  }`}
                >
                  <Text className="text-2xl text-[#505052]">{mood.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-7">
        <CustomPrimaryButton
          title="Complete Today&apos;s Journey"
          onPress={onPressComplete}
          loading={isSubmitting}
          className="rounded-3xl bg-[#F6CF00]"
          textClassName="text-lg text-[#2D2D2D]"
        />
      </View>
    </SafeAreaView>
  );
}
