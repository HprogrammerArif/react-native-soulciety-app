import {
    Feather,
    Ionicons,
    MaterialCommunityIcons,
    SimpleLineIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- MOOD HOOK ---
import { useMood } from "@/hooks/useMood";

// --- MOOD ICONS ---
import AngryIcon from "@/assets/images/angry.svg";
import AnxiousIcon from "@/assets/images/anxious.svg";
import ConfidentIcon from "@/assets/images/confident.svg";
import ExcitedIcon from "@/assets/images/excited.svg";
import FearIcon from "@/assets/images/fear.svg";
import HappyIcon from "@/assets/images/happy.svg";
import RelaxedIcon from "@/assets/images/relaxed.svg";
import SadIcon from "@/assets/images/sad.svg";
import SatisfiedIcon from "@/assets/images/satisfied.svg";
import SickIcon from "@/assets/images/sick.svg";

import ChangeMoodModal from "@/components/modules/profile/ChangeMoodModal";
import DeleteAccountModal from "@/components/modules/profile/DeleteAccountModal";
import LogoutModal from "@/components/modules/profile/LogoutModal";
import { useUser } from "@/hooks/useUser";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

    useEffect(() => {
        const loadNotificationPref = async () => {
            try {
                const val = await AsyncStorage.getItem("@notifications_enabled");
                if (val !== null) {
                    setIsNotificationEnabled(val === "true");
                }
            } catch (e) {
                if (__DEV__) console.log("Error loading notification pref", e);
            }
        };
        loadNotificationPref();
    }, []);

    const handleToggleNotification = async (enabled: boolean) => {
        setIsNotificationEnabled(enabled);
        try {
            Haptics.selectionAsync();
        } catch {}
        try {
            await AsyncStorage.setItem("@notifications_enabled", enabled ? "true" : "false");
            Toast.show({
                type: "info",
                text1: enabled ? "Notifications Enabled" : "Notifications Disabled",
                text2: enabled ? "You will receive daily reminders and updates." : "Push notifications paused.",
                visibilityTime: 2000,
            });
        } catch (e) {
            if (__DEV__) console.log("Error saving notification pref", e);
        }
    };
    const [logoutModalVisibal, setLogoutModalVisibal] = useState(false);
    const [changeMoodModalVisible, setChangeMoodModalVisible] = useState(false);
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const { moodKey, loading, saving, saveMood } = useMood();
    const { logout, loginState, profile, updateProfile, updateProfileState, deleteAccount } = useUser()

    // --- MOOD MAP (KEY BASED) ---
    const MOOD_MAP: Record<
        string,
        { label: string; icon: any; color: string }
    > = {
        happy: { label: "Happy", icon: HappyIcon, color: "bg-yellow-100" },
        sad: { label: "Sad", icon: SadIcon, color: "bg-blue-100" },
        angry: { label: "Angry", icon: AngryIcon, color: "bg-red-100" },
        sick: { label: "Sick", icon: SickIcon, color: "bg-green-100" },
        fear: { label: "Fear", icon: FearIcon, color: "bg-purple-100" },
        anxious: { label: "Anxious", icon: AnxiousIcon, color: "bg-orange-100" },
        satisfied: { label: "Satisfied", icon: SatisfiedIcon, color: "bg-yellow-100" },
        relaxed: { label: "Relaxed", icon: RelaxedIcon, color: "bg-sky-100" },
        confident: { label: "Confident", icon: ConfidentIcon, color: "bg-indigo-100" },
        excited: { label: "Excited", icon: ExcitedIcon, color: "bg-pink-100" },
    };

    const currentMood = moodKey ? MOOD_MAP[moodKey] : null;

    const handleLogout = async () => {
        try {
            await logout()
            Toast.show({ type: "success", text1: "Logout Successfully!", text2: "Please log in again." });
            router.replace("/(auth)/login")
        } catch (error) {
            if (__DEV__) console.log(error)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            await deleteAccount();
            setDeleteAccountModalVisible(false);
            Toast.show({ type: "success", text1: "Account Deleted", text2: "Your account has been permanently deleted." });
            router.replace("/(auth)/login");
        } catch (error: any) {
            if (__DEV__) console.log(error);
            Toast.show({
                type: "error",
                text1: "Failed to delete account",
                text2: error?.response?.data?.detail || "Something went wrong. Please try again.",
            });
        } finally {
            setIsDeletingAccount(false);
        }
    }

    const handleChangeMoodConfirm = async () => {
        try {
            // Reset mood to default (angry) without showing success message
            await saveMood("angry", false);
            // Close modal after save completes
            setChangeMoodModalVisible(false);
            // Navigate to change mood screen
            router.push("/profile/change-mood");
        } catch (error) {
            if (__DEV__) console.log(error);
        }
    }

    const formatMemberSince = (memberSince?: string | null) => {
        if (!memberSince) return "";
        const parsed = new Date(memberSince);
        if (Number.isNaN(parsed.getTime())) return memberSince;
        return parsed.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // --- REUSABLE ROW ---
    const MenuItem = ({
        icon,
        label,
        showArrow = true,
        showSwitch = false,
        onPress,
        isDestructive = false,
    }: {
        icon: React.ReactNode;
        label: string;
        showArrow?: boolean;
        showSwitch?: boolean;
        onPress?: () => void;
        isDestructive?: boolean;
    }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={showSwitch}
            className="flex-row items-center justify-between py-4"
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View className="flex-row items-center gap-4">
                <View
                    className={`w-10 h-10 rounded-full justify-center items-center ${isDestructive ? "bg-red-50" : "bg-gray-100"
                        }`}
                >
                    {icon}
                </View>
                <Text
                    className={`text-base font-medium ${isDestructive ? "text-red-500 " : "text-gray-800"
                        }`}
                >
                    {label}
                </Text>
            </View>

            <View>
                {showSwitch && (
                    <Switch
                        trackColor={{ false: "#767577", true: "#FCD34D" }}
                        thumbColor={"#fff"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={handleToggleNotification}
                        value={isNotificationEnabled}
                        accessibilityLabel="Toggle notifications"
                    />
                )}
                {showArrow && (
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) return null;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View className="items-center mt-8 mb-8">
                    {profile?.data?.profile_picture_url ? (
                        <Image
                            source={{ uri: profile.data.profile_picture_url }}
                            className="w-28 h-28 rounded-full border-4 border-white shadow-sm"
                            accessibilityLabel="Profile picture"
                        />
                    ) : (
                        <View className="w-28 h-28 rounded-full border-4 border-white shadow-sm bg-yellow-100 items-center justify-center">
                            <Ionicons name="person" size={56} color="#CA8A04" />
                        </View>
                    )}
                    <Text className="text-2xl font-bold text-gray-900 mt-4">
                        {profile?.data?.full_name}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                        Member since {formatMemberSince(profile?.data?.member_since)}
                    </Text>
                </View>

                <View className="px-5 gap-4">
                    <Text className="text-gray-800 font-bold text-base ml-1 mb-2">
                        Personal
                    </Text>

                    {/* SETTINGS */}
                    <View className="bg-white rounded-3xl px-5 py-2 shadow-sm border border-gray-100">
                        <MenuItem
                            label="Profile setting"
                            icon={<Feather name="user" size={20} color="#4B5563" />}
                            onPress={() => router.push("/profile/profile-setting")}
                        />
                        <View className="h-[1px] bg-gray-50 w-full" />
                        <MenuItem
                            label="Notification"
                            icon={<Feather name="bell" size={20} color="#4B5563" />}
                            showArrow={false}
                            showSwitch
                        />
                    </View>

                    {/* MOOD CARD */}
                    <View className="bg-white rounded-3xl p-5 flex-row items-center justify-between shadow-sm border border-gray-100">
                        <View className="flex-row items-center gap-4">
                            <View
                                className={`w-12 h-12 rounded-full justify-center items-center ${currentMood?.color ?? "bg-gray-100"
                                    }`}
                            >
                                {currentMood?.icon && (
                                    <currentMood.icon width="100%" height="100%" />
                                )}
                            </View>

                            <Text className="text-gray-800 font-medium text-base">
                                {currentMood?.label ?? "No mood set"}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setChangeMoodModalVisible(true)}
                            disabled={saving}
                            className="flex-row items-center gap-2"
                            accessibilityLabel="Change mood"
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#6B7280" />
                            ) : (
                                    <Text className="text-gray-500 font-bold text-sm">
                                        Change mood
                                    </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* CONTENT */}
                    <View className="bg-white rounded-3xl px-5 py-2 shadow-sm border border-gray-100">
                        <MenuItem
                            label="Saved Spiritual"
                            icon={
                                <MaterialCommunityIcons
                                    name="flower-tulip-outline"
                                    size={22}
                                    color="#4B5563"
                                />
                            }
                            onPress={() => router.push("/profile/saved-spiritual")}
                        />
                        <View className="h-[1px] bg-gray-50 w-full" />
                        <MenuItem
                            label="Journal Archive"
                            icon={
                                <SimpleLineIcons
                                    name="notebook"
                                    size={20}
                                    color="#4B5563"
                                />
                            }
                            onPress={() =>
                                router.push("/profile/journal-archive")
                            }
                        />
                    </View>

                    {/* LEGAL & SUPPORT */}
                    <View className="bg-white rounded-3xl px-5 py-2 shadow-sm border border-gray-100">
                        <MenuItem
                            label="Help center"
                            icon={
                                <Feather
                                    name="help-circle"
                                    size={22}
                                    color="#4B5563"
                                />
                            }
                            onPress={() => router.push("/profile/help-center")}
                        />
                        <View className="h-[1px] bg-gray-50 w-full" />
                        <MenuItem
                            label="Privacy Policy"
                            icon={
                                <Feather
                                    name="shield"
                                    size={20}
                                    color="#4B5563"
                                />
                            }
                            onPress={() => router.push({ pathname: "/profile/legal", params: { type: "privacy" } })}
                        />
                        <View className="h-[1px] bg-gray-50 w-full" />
                        <MenuItem
                            label="Terms of Service"
                            icon={
                                <Feather
                                    name="file-text"
                                    size={20}
                                    color="#4B5563"
                                />
                            }
                            onPress={() => router.push({ pathname: "/profile/legal", params: { type: "terms" } })}
                        />
                    </View>

                    {/* LOGOUT & DELETE */}
                    <View className="bg-white rounded-3xl px-5 py-2 shadow-sm border border-gray-100">
                        <MenuItem
                            label="Log out"
                            icon={
                                <Feather name="log-out" size={20} color="#EF4444" />
                            }
                            showArrow={false}
                            isDestructive
                            onPress={() => setLogoutModalVisibal(true)}
                        />
                        <View className="h-[1px] bg-gray-50 w-full" />
                        <MenuItem
                            label="Delete Account"
                            icon={
                                <Feather name="trash-2" size={20} color="#EF4444" />
                            }
                            showArrow={false}
                            isDestructive
                            onPress={() => setDeleteAccountModalVisible(true)}
                        />
                    </View>

                    <LogoutModal
                        visible={logoutModalVisibal}
                        onConfirm={handleLogout}
                        loading={loginState.isPending}
                        onCancel={() => setLogoutModalVisibal(false)}
                    />

                    <ChangeMoodModal
                        visible={changeMoodModalVisible}
                        onConfirm={handleChangeMoodConfirm}
                        loading={saving}
                        onCancel={() => setChangeMoodModalVisible(false)}
                    />

                    <DeleteAccountModal
                        visible={deleteAccountModalVisible}
                        onConfirm={handleDeleteAccount}
                        loading={isDeletingAccount}
                        onCancel={() => setDeleteAccountModalVisible(false)}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
