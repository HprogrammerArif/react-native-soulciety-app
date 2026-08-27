import { useSession } from "@/hooks/useSession";
import { MaterialIcons } from "@expo/vector-icons";
import { speak, stop } from "@/lib/elevenlabsTTS";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionHeader from "./SessionHeader";

const VISUALIZATION_CLOSING_LINES = [
    "Carry this feeling with you into the rest of your day. Whenever you're ready, open your eyes and come back feeling refreshed.",
    "Remember, this version of you already exists within you. Take one last breath and gently open your eyes.",
];

type SessionScreen1Props = {
    onBack: () => void;
    onContinue: () => void;
};

const SessionScreen_1: React.FC<SessionScreen1Props> = ({
    onBack,
    onContinue,
}) => {
    const { today } = useSession();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSpeechLoading, setIsSpeechLoading] = useState(false);

    const title = today.data?.theme?.theme_title || "Today Session";
    const reflectionText =
        today.data?.content?.guided_reflection ||
        "Take a moment to settle into your body, breathe slowly, and notice what you are carrying today.";

    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    const handlePlayPauseSpeech = async () => {
        try {
            if (isSpeaking || isSpeechLoading) {
                await stop();
                setIsSpeaking(false);
                setIsSpeechLoading(false);
                return;
            }

            setIsSpeechLoading(true);

            speak(reflectionText, {
                onStart: () => {
                    setIsSpeechLoading(false);
                    setIsSpeaking(true);
                },
                onDone: () => {
                    // Play a closing line after the reflection finishes
                    const closingText = VISUALIZATION_CLOSING_LINES[
                        Math.floor(Math.random() * VISUALIZATION_CLOSING_LINES.length)
                    ];
                    speak(closingText, {
                        onDone: () => setIsSpeaking(false),
                        onError: () => setIsSpeaking(false),
                    });
                },
                onError: (error) => {
                    setIsSpeaking(false);
                    setIsSpeechLoading(false);
                    console.error("Speech error:", error);
                },
            });
        } catch (error) {
            setIsSpeaking(false);
            setIsSpeechLoading(false);
            console.error("Speech trigger error:", error);
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

            <View className="px-4 pt-2">
                <SessionHeader title={title} onBackPress={onBack} />
            </View>

            <ScrollView
                className="mt-2 flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <Text className="mb-5 text-2xl font-bold text-gray-800">
                    Guided Reflection
                </Text>

                <Text className="text-lg leading-8 text-gray-700">{reflectionText}</Text>

                <View className="mb-10 mt-20 items-center justify-center">
                    <TouchableOpacity
                        className="h-16 w-16 items-center justify-center rounded-full bg-gray-200"
                        activeOpacity={0.8}
                        onPress={handlePlayPauseSpeech}
                    >
                        {isSpeechLoading ? (
                            <ActivityIndicator size="small" color="#444" />
                        ) : (
                            <MaterialIcons
                                name={isSpeaking ? "pause" : "play-arrow"}
                                size={32}
                                color="#444"
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View className="px-6 pb-8">
                <TouchableOpacity
                    className="items-center rounded-xl bg-[#FFD210] py-4 shadow-sm"
                    activeOpacity={0.9}
                    onPress={onContinue}
                >
                    <Text className="text-lg font-bold text-black">Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default SessionScreen_1;