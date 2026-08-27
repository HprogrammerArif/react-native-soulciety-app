import sunDarkImage from "@/assets/images/sun_img_dark.jpg";
import sunLightImage from "@/assets/images/sun_img_light.jpg";
import { speak, stop } from "@/lib/elevenlabsTTS";
import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import { useSession } from "@/hooks/useSession";
import { CompleteDayResponse } from "@/services/session.api";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";
import { Feather } from "@expo/vector-icons";

type SessionScreen5Props = {
    onBack: () => void;
    onContinue: () => void;
};

type BreathPhaseKey = "inhale" | "hold_in" | "exhale" | "hold_out";

type BreathPhase = {
    key: BreathPhaseKey;
    label: string;
    duration: number;
    hint: string;
};

const formatTime = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function SessionScreen_5({
    onBack,
    onContinue,
}: SessionScreen5Props) {
    const { today } = useSession();
    const dayNumber = today.data?.day_number;
    const exercise = today.data?.content?.breathing_exercise;

    const phases = useMemo<BreathPhase[]>(
        () => [
            {
                key: "inhale",
                label: "Inhale",
                duration: exercise?.inhale_seconds ?? 4,
                hint: "Breathe in slowly through your nose.",
            },
            {
                key: "hold_in",
                label: "Hold In",
                duration: exercise?.hold_in_seconds ?? 4,
                hint: "Hold the breath softly, without tension.",
            },
            {
                key: "exhale",
                label: "Exhale",
                duration: exercise?.exhale_seconds ?? 4,
                hint: "Release the air slowly and fully.",
            },
            {
                key: "hold_out",
                label: "Hold Out",
                duration: exercise?.hold_out_seconds ?? 4,
                hint: "Rest at the end of the exhale.",
            },
        ],
        [
            exercise?.exhale_seconds,
            exercise?.hold_in_seconds,
            exercise?.hold_out_seconds,
            exercise?.inhale_seconds,
        ],
    );

    const totalRounds = exercise?.rounds ?? 4;
    const title = today.data?.theme?.theme_title || "Today Session";
    const breathName = exercise?.name || "Breathwork Practice";
    const breathDescription =
        exercise?.description ||
        "Follow the breathing rhythm and stay present with each round.";

    const [currentRound, setCurrentRound] = useState(1);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(phases[0]?.duration ?? 4);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isClosingSpeaking, setIsClosingSpeaking] = useState(false);
    const hasPlayedReminder = useRef(false);
    const hasPlayedClosing = useRef(false);

    const currentPhase = phases[phaseIndex];
    const breathScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        setCurrentRound(1);
        setPhaseIndex(0);
        setSecondsLeft(phases[0]?.duration ?? 4);
        setIsRunning(false);
        setHasStarted(false);
        setIsComplete(false);
        setIsClosingSpeaking(false);
        breathScale.setValue(1);
        hasPlayedReminder.current = false;
        hasPlayedClosing.current = false;
    }, [phases]);

    // Gentle reminder TTS during the last round
    const playGentleReminder = useCallback(() => {
        if (hasPlayedReminder.current) return;
        hasPlayedReminder.current = true;

        const reminders = [
            "You're doing beautifully. Just a few more breaths.",
            "Allow yourself to soak in this feeling for a few more moments.",
        ];
        const text = reminders[Math.floor(Math.random() * reminders.length)];
        speak(text, {
            onError: (err) => console.error("Reminder TTS error:", err),
        });
    }, []);

    // Closing TTS when breathing exercise completes
    useEffect(() => {
        if (!isComplete || hasPlayedClosing.current) return;
        hasPlayedClosing.current = true;
        setIsClosingSpeaking(true);

        const closingLines = [
            "Take one final deep breath in… and slowly let it go. When you're ready, gently open your eyes.",
            "Take a moment to notice how you feel. There's nothing you need to force or change. When you're ready, softly open your eyes.",
        ];
        const text = closingLines[Math.floor(Math.random() * closingLines.length)];
        speak(text, {
            onDone: () => setIsClosingSpeaking(false),
            onError: () => setIsClosingSpeaking(false),
        });
    }, [isComplete]);

    // Cleanup TTS on unmount
    useEffect(() => {
        return () => { stop(); };
    }, []);

    useEffect(() => {
        if (!isRunning || isComplete) {
            breathScale.stopAnimation();
            return;
        }

        const targetScale = (currentPhase?.key === "inhale" || currentPhase?.key === "hold_in") ? 1.8 : 1.0;
        const animationDuration = secondsLeft * 1000;

        Animated.timing(breathScale, {
            toValue: targetScale,
            duration: animationDuration > 0 ? animationDuration : 0,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();

        return () => {
            breathScale.stopAnimation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phaseIndex, isRunning, isComplete]);

    useEffect(() => {
        if (!isRunning || isComplete || secondsLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isComplete, isRunning, secondsLeft]);

    useEffect(() => {
        if (!isRunning || isComplete || secondsLeft > 0) {
            return;
        }

        const nextPhaseIndex = phaseIndex + 1;
        if (nextPhaseIndex < phases.length) {
            setPhaseIndex(nextPhaseIndex);
            setSecondsLeft(phases[nextPhaseIndex].duration);
            return;
        }

        if (currentRound < totalRounds) {
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            setPhaseIndex(0);
            setSecondsLeft(phases[0].duration);

            // Trigger gentle reminder when entering the last round
            if (nextRound === totalRounds) {
                playGentleReminder();
            }
            return;
        }

        setIsRunning(false);
        setIsComplete(true);
    }, [
        currentRound,
        isComplete,
        isRunning,
        phaseIndex,
        phases,
        playGentleReminder,
        secondsLeft,
        totalRounds,
    ]);

    const backgroundSource = (isRunning || hasStarted) && !isComplete ? sunLightImage : sunDarkImage;
    const isDarkBg = !((isRunning || hasStarted) && !isComplete);
    const headerTextColor = isDarkBg ? "text-white" : "text-[#1D1D1F]";

    const primaryButtonLabel = useMemo(() => {
        if (isComplete) {
            return "Complete Breathwork";
        }

        if (isRunning) {
            return "Pause Breathwork";
        }

        if (hasStarted) {
            return "Resume Breathwork";
        }

        return "Start Breathwork";
    }, [hasStarted, isComplete, isRunning]);

    const statusTitle = useMemo(() => {
        if (isComplete) {
            return "Breathwork complete";
        }

        return currentPhase?.label || "Breathwork";
    }, [currentPhase?.label, isComplete]);

    const statusHint = useMemo(() => {
        if (isComplete) {
            return "All rounds are complete. Finish the day when you're ready.";
        }

        return currentPhase?.hint || "Follow the breathing rhythm.";
    }, [currentPhase?.hint, isComplete]);

    const progressText = useMemo(() => {
        if (isComplete) {
            return "Finished all rounds";
        }

        return `Round ${currentRound} of ${totalRounds}`;
    }, [currentRound, isComplete, totalRounds]);

    const onPressPrimary = async () => {
        if (isComplete) {
            onContinue();
            return;
        }

        setHasStarted(true);
        setIsRunning((prev) => !prev);
    };

    const onRestart = () => {
        setPhaseIndex(0);
        setCurrentRound(1);
        setSecondsLeft(phases[0]?.duration ?? 4);
        setHasStarted(false);
        setIsRunning(false);
        setIsComplete(false);
        breathScale.setValue(1);
    };

    if (today.isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F7F7]">
                <ActivityIndicator size="large" color="#FFD210" />
            </SafeAreaView>
        );
    }

    return (
        <ImageBackground source={backgroundSource} className="flex-1" resizeMode="cover">
            <StatusBar style={isDarkBg ? "light" : "dark"} />

            <SafeAreaView className="flex-1">
                <View className="px-6 pt-2">
                    <SessionHeader title={title} onBackPress={onBack} textColor={headerTextColor} />
                </View>

                <View className="flex-1 px-6 pb-1">
                    <View className="flex-1 rounded-[34px] overflow-hidden border border-white/20 shadow-sm">
                        <BlurView
                            intensity={70}
                            tint="light"
                            className="flex-1 items-center justify-between px-5 py-6"
                        >
                            <View className="items-center w-full">
                                <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C4943E]">
                                    Breathing Exercise
                                </Text>
                                <Text className="text-center text-3xl font-semibold text-gray-800">
                                    {breathName}
                                </Text>
                                <Text className="mt-3 text-center text-sm leading-6 text-gray-900">
                                    {breathDescription}
                                </Text>
                            </View>

                            {/* Breathing Animation Design */}
                            <View className="items-center justify-center my-6 flex-1 relative w-full">
                                {/* Outer pulsing ring */}
                                <Animated.View
                                    style={{
                                        transform: [{ scale: breathScale }],
                                        opacity: breathScale.interpolate({
                                            inputRange: [1, 1.8],
                                            outputRange: [0.15, 0.4],
                                        }),
                                    }}
                                    className="absolute h-52 w-52 rounded-full bg-[#FFD210]"
                                />

                                {/* Inner pulsing circle */}
                                <Animated.View
                                    style={{
                                        transform: [{
                                            scale: breathScale.interpolate({
                                                inputRange: [1, 1.8],
                                                outputRange: [1, 1.3],
                                            })
                                        }],
                                    }}
                                    className="absolute h-36 w-36 rounded-full bg-[#FFD210]/30 border-2 border-[#FFD210]/40"
                                />

                                {/* Center content (not scaled, keeping text sharp and static size) */}
                                <View className="items-center justify-center z-10 bg-white/80 h-28 w-28 rounded-full border border-gray-100 shadow-sm">
                                    {isComplete ? (
                                        <Feather name="check" size={44} color="#10B759" />
                                    ) : (
                                        <>
                                            <Text className="text-xl font-bold uppercase tracking-wider text-gray-800 text-center">
                                                {statusTitle}
                                            </Text>
                                            <Text className="text-3xl font-light text-gray-900 mt-1">
                                                {formatTime(secondsLeft)}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            <View className="w-full items-center mb-6">
                                <View className="mb-2 rounded-full bg-gray-100 px-4 py-2">
                                    <Text className="text-sm font-semibold text-gray-700">
                                        {progressText}
                                    </Text>
                                </View>
                                <Text className="text-center text-sm leading-6 text-gray-900 max-w-[280px]">
                                    {statusHint}
                                </Text>
                            </View>

                            <View className="w-full gap-3">
                                {!isComplete && hasStarted ? (
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            className="flex-1 items-center rounded-2xl bg-[#FFD210] py-4"
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
                                            <Text className="text-lg font-semibold text-gray-700">
                                                Restart Practice
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <CustomPrimaryButton
                                        title={primaryButtonLabel}
                                        onPress={onPressPrimary}
                                        className="rounded-2xl bg-[#FFD210]"
                                        textClassName="text-lg text-black"
                                    />
                                )}
                            </View>
                        </BlurView>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}
