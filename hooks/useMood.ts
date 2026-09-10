import { updateStoredProfile } from "@/lib/profileStorage";
import { updateMoodApi } from "@/services/mood.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "user_mood";

type StoredMood = {
  moodKey: string;
  date: string; // YYYY-MM-DD
};

const today = () => new Date().toISOString().split("T")[0];

export function useMood() {
  const [moodKey, setMoodKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  // ---------- LOAD MOOD ----------
  const loadMood = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }

      const parsed: StoredMood = JSON.parse(stored);

      // reset if new day
      if (parsed.date !== today()) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setMoodKey(null);
      } else {
        setMoodKey(parsed.moodKey);
      }
    } catch {
      setMoodKey(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------- SAVE / UPDATE MOOD ----------
  const saveMood = async (
    newMoodKey: string,
    showSuccessMessage: boolean = true,
  ) => {
    setSaving(true);
    const payload: StoredMood = {
      moodKey: newMoodKey,
      date: today(),
    };

    // instant local update
    setMoodKey(newMoodKey);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // sync with backend (safe, non-blocking)
    try {
      await updateMoodApi(newMoodKey);
      await updateStoredProfile({ current_mood: newMoodKey });
      queryClient.setQueryData(["profile"], (old: any) => old ? { ...old, current_mood: newMoodKey } : old);
      if (showSuccessMessage) {
        setTimeout(() => {
          Toast.show({ type: "success", text1: "Mood saved!" });
        }, 200);
      }
    } catch (error: any) {
      if (__DEV__) console.log("MOOD_API_ERROR", error?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const resetMood = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setMoodKey(null);
  };

  useEffect(() => {
    loadMood();
  }, []);

  return {
    moodKey, // string | null
    loading, // boolean
    saving, // boolean
    saveMood, // (key: string) => void
    resetMood,
  };
}
