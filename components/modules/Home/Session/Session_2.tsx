import { useSession } from "@/hooks/useSession";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { speak, stop } from "@/lib/elevenlabsTTS";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";

const AFFIRMATION_CLOSING_LINES = [
    "Let these words settle into your subconscious. You don't need to force them—they're already becoming part of who you are. Take a deep breath and gently open your eyes.",
    "The energy you cultivated here stays with you. Return to your day feeling grounded, aligned, and present.",
];

type SessionScreen2Props = {
  onBack: () => void;
  onContinue: () => void;
};

const SessionScreen_2: React.FC<SessionScreen2Props> = ({
  onBack,
  onContinue,
}) => {
  const {
    today,
    saveAffirmation,
    saveAffirmationState,
    shareToCommunity,
    shareToCommunityState,
    savedAffirmations,
    deleteAffirmation,
    deleteAffirmationState,
  } = useSession();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const title = today.data?.theme?.theme_title || "Today Session";
  const affirmation =
    today.data?.content?.affirmation || "I am worthy of peace and healing.";
  const dayNumber = today.data?.day_number;

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const onPressHearAffirmation = async () => {
    if (isSpeaking) {
      await stop();
      setIsSpeaking(false);
      return;
    }

    speak(affirmation, {
      onStart: () => setIsSpeaking(true),
      onDone: () => {
        // Play a closing line after the affirmation finishes
        const closingText = AFFIRMATION_CLOSING_LINES[
          Math.floor(Math.random() * AFFIRMATION_CLOSING_LINES.length)
        ];
        speak(closingText, {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      },
      onError: () => setIsSpeaking(false),
    });
  };

  const onPressSaveAffirmation = async () => {
    if (!dayNumber) {
      Alert.alert("Unavailable", "Could not identify today's day number.");
      return;
    }

    try {
      const res = await saveAffirmation(dayNumber);
      Alert.alert("Affirmation", res.message || "Affirmation saved successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save affirmation.";
      Alert.alert("Save failed", message);
    }
  };

  const onPressShare = async () => {
    if (!dayNumber) {
      Alert.alert("Unavailable", "Could not identify today's day number.");
      return;
    }

    try {
      const res = await shareToCommunity({ dayNumber, type: "affirmation" });
      Alert.alert("Shared", res.message || "Shared to community successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to share affirmation.";
      Alert.alert("Share failed", message);
    }
  };

  const handleDeleteAffirmation = async (id: number) => {
    Alert.alert(
      "Delete Affirmation",
      "Are you sure you want to delete this affirmation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAffirmation(id);
            } catch (error: any) {
              const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to delete affirmation.";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
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

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <View
          className="rounded-[40px] border border-gray-50 bg-white p-8 shadow-sm mb-6"
          style={{ elevation: 2 }}
        >
          <Text className="mb-8 mt-4 text-center text-2xl font-semibold leading-9 text-[#96690B]">
            "{affirmation}"
          </Text>

          <TouchableOpacity
            className="mb-8 self-center rounded-full border border-gray-200 px-6 py-3"
            activeOpacity={0.6}
            onPress={onPressHearAffirmation}
          >
            <View className="flex-row items-center justify-center">
              <MaterialCommunityIcons
                name={isSpeaking ? "volume-off" : "volume-high"}
                size={20}
                color="#777"
              />
              <Text className="ml-2 text-sm font-medium text-gray-500">
                {isSpeaking
                  ? "Tap to stop spoken affirmation"
                  : "Tap to hear spoken affirmation"}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="gap-4">
            <TouchableOpacity
              className="items-center rounded-2xl bg-[#FFD210] py-4"
              activeOpacity={0.8}
              onPress={onContinue}
            >
              <Text className="text-lg font-semibold text-black">
                I feel this, Continue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-2xl border border-gray-200 py-4"
              activeOpacity={0.6}
              onPress={onPressSaveAffirmation}
              disabled={saveAffirmationState.isPending}
            >
              <Text className="text-lg font-semibold text-gray-600">
                {saveAffirmationState.isPending
                  ? "Saving affirmation..."
                  : "Save affirmation"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row items-center justify-end border-t border-gray-100 pt-4">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={onPressShare}
              disabled={shareToCommunityState.isPending}
            >
              <Text className="mr-2 font-medium text-gray-600">Share</Text>
              <Feather name="share-2" size={18} color="#444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Affirmations List */}
        {savedAffirmations.data && savedAffirmations.data.length > 0 && (
          <View className="mb-10">
            <Text className="mb-4 text-lg font-bold text-gray-800 px-2">Saved Affirmations</Text>
            {savedAffirmations.data.map((item) => (
              <View key={item.id} className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                <Text className="flex-1 text-base text-gray-700 mr-4 leading-6">"{item.text}"</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteAffirmation(item.id)}
                  disabled={deleteAffirmationState.isPending}
                  className="p-2"
                >
                  <Feather name="trash-2" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SessionScreen_2;