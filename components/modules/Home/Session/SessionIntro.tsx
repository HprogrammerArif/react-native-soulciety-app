import { useSession } from "@/hooks/useSession";
import { HealingTheme } from "@/services/session.api";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import SessionHeader from "./SessionHeader";

type TodaySessionCardProps = {
  progress: number;
  theme: string;
  description: string;
  durationLabel: string;
  phaseLabel: string;
    onStartPress: () => void;
};

type StreakBannerProps = {
    streakDays: number;
    subtitle: string;
};

type ProgressRingProps = {
    progress: number;
    size?: number;
    strokeWidth?: number;
    trackColor?: string;
    progressColor?: string;
};

type SessionIntroScreenProps = {
    onStartSession?: () => void;
};

export default function SessionIntroScreen({
    onStartSession,
}: SessionIntroScreenProps) {
    const router = useRouter();
    const { today, plan, progress } = useSession();

    const isLoading = today.isLoading || plan.isLoading || progress.isLoading;

    const activeDay = today.data?.day_number ?? 1;
    const streakDays = progress.data?.current_streak ?? 0;
    const progressPercent = Math.min(
        100,
        Math.round(((progress.data?.total_days_completed ?? 0) / 30) * 100),
    );

    const themeTitle = today.data?.theme?.theme_title || "Your theme is getting ready";
    const themeDescription =
        today.data?.theme?.theme_intention ||
        "Keep going you are doing great on your healing journey.";
    const phaseLabel = today.data?.theme?.theme_category
        ? `${today.data.theme.theme_category} Phase`
        : "Healing Phase";

    const durationSeconds = today.data?.content?.physical_workout?.duration_seconds;
    const durationMins = durationSeconds
        ? Math.max(1, Math.round(durationSeconds / 60))
        : 12;

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#F5F5F5]">
                <ActivityIndicator size="large" color="#F8D300" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F5F5F5]">
            <ScrollView
                className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
          >
              <SessionHeader title="30 days journey" onBackPress={() => router.back()} />

              <StreakBanner
                  streakDays={streakDays}
                  subtitle="Keep going you doing great!"
              />

              <JourneyMapCard
                  activeDay={activeDay}
                  themes={plan.data?.themes ?? []}
                  onStartPress={onStartSession || (() => { })}
              />

              <TodaySessionCard
                  progress={progressPercent}
                  theme={themeTitle}
                  description={themeDescription}
                  durationLabel={`${durationMins} min`}
                  phaseLabel={phaseLabel}
                  onStartPress={onStartSession || (() => { })}
              />
          </ScrollView>
      </SafeAreaView>
  );
}


const StreakBanner = ({ streakDays, subtitle }: StreakBannerProps) => {
    return (
        <View className="mb-4 flex-row items-center rounded-3xl bg-white px-5 py-4">
          <Text className="mr-3 text-3xl">🔥</Text>

          <View>
                <Text className="text-xl font-bold text-[#1F1F20]">{streakDays} day streak</Text>
                <Text className="mt-1 text-sm text-[#5A5A5D]">{subtitle}</Text>
            </View>
        </View>
    );
};

type JourneyMapCardProps = {
    activeDay: number;
    themes: HealingTheme[];
    onStartPress: () => void;
};

const JourneyMapCard = ({ activeDay, themes, onStartPress }: JourneyMapCardProps) => {
    const dayStateMap = themes.reduce<Record<number, string>>((acc, item) => {
        acc[item.day_number] = item.state;
        return acc;
    }, {});

    const days = Array.from({ length: 30 }, (_, index) => index + 1);

    return (
        <View className="mb-4 rounded-3xl bg-white p-4">
            <View className="flex-row flex-wrap justify-between">
                {days.map((day) => {
                    const state = dayStateMap[day];
                    const isCompleted = state === "completed";
                    const isActive = day === activeDay;

                    return (
                        <View key={day} className="mb-4 w-[14.2%] items-center">
                            {isCompleted ? (
                                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#10B759]">
                                    <Ionicons name="checkmark" size={16} color="white" />
                                </View>
                            ) : day < activeDay ? (
                                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#FF4D4D]">
                                    <Ionicons name="close" size={16} color="white" />
                                </View>
                            ) : (
                                <Text
                                        className={`text-xl ${isActive
                                            ? "font-bold text-[#1B1B1D]"
                                            : "font-medium text-[#A2A2A7]"
                                        }`}
                                >
                                    {day}
                                </Text>
                            )}
                        </View>
                    );
                })}
            </View>

            <View className="mt-2 rounded-3xl bg-[#E6E6E8] px-4 py-4">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-[#222226]">Day {activeDay}</Text>
                        <Text className="mt-1 text-sm text-[#5A5A5D]">Keep going you doing great!</Text>
                    </View>

                    <TouchableOpacity
                        className="rounded-full bg-[#F8D300] px-10 py-3"
                        onPress={onStartPress}
                    >
                        <Text className="text-lg font-semibold text-[#2F2F32]">Start</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const ProgressRing = ({
    progress,
    size = 110,
    strokeWidth = 12,
    trackColor = "#A9A9AD",
    progressColor = "#F8D300",
}: ProgressRingProps) => {
    const safeProgress = Math.max(0, Math.min(100, progress));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (safeProgress / 100) * circumference;

    return (
        <View className="items-center justify-center">
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={progressColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

          <View className="absolute">
              <Text className="text-lg font-semibold text-[#2A2A2D]">{safeProgress}%</Text>
          </View>
      </View>
  );
};



const TodaySessionCard = ({
  progress,
  theme,
  description,
  durationLabel,
  phaseLabel,
    onStartPress,
}: TodaySessionCardProps) => {
  return (
      <View className="rounded-3xl bg-white p-5">
      <View className="items-center py-1">
        <ProgressRing progress={progress} />
      </View>

          <Text className="mt-3 text-center text-base text-[#4A4A4D]">Current Journey Progress</Text>

          <Text className="mt-6 text-xs font-medium tracking-widest text-[#B78D10]">TODAY&apos;S THEME</Text>

          <Text className="mt-2 text-4xl font-bold text-[#1E1E20]">{theme}</Text>

          <Text className="mt-2 text-xl text-[#3F3F42]">{description}</Text>

          <View className="mt-5 flex-row items-center gap-8">
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={20} color="#727276" />
                  <Text className="text-base text-[#727276]">{durationLabel}</Text>
        </View>

        <View className="flex-row items-center gap-2">
                  <MaterialIcons name="spa" size={18} color="#4B8E2E" />
                  <Text className="text-base text-[#727276]">{phaseLabel}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onStartPress}
        activeOpacity={0.85}
              className="mt-6 items-center justify-center rounded-3xl bg-[#F8D300] py-4"
      >
              <Text className="text-lg font-bold text-[#323232]">Start Today&apos;s Session</Text>
      </TouchableOpacity>
    </View>
  );
};