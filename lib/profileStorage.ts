import AsyncStorage from "@react-native-async-storage/async-storage";
import { Profile } from "@/types/user.types";

const PROFILE_KEY = "profile";

/**
 * Get cached profile
 */
export const getStoredProfile = async (): Promise<Profile | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Failed to read profile cache", error);
    return null;
  }
};

/**
 * Store full profile (overwrite)
 */
export const storeProfile = async (profile: Profile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("❌ Failed to store profile", error);
  }
};

/**
 * Update only changed fields (MERGE)
 * 🔥 THIS IS THE KEY FIX
 */
export const updateStoredProfile = async (
  updates: Partial<Profile>
): Promise<Profile | null> => {
  try {
    const existing = await AsyncStorage.getItem(PROFILE_KEY);
    if (!existing) return null;

    const current: Profile = JSON.parse(existing);

    const updatedProfile: Profile = {
      ...current,
      ...updates,
    };

    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

    return updatedProfile;
  } catch (error) {
    console.error("❌ Failed to update profile cache", error);
    return null;
  }
};

/**
 * Clear cached profile
 */
export const clearProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error("❌ Failed to clear profile cache", error);
  }
};
