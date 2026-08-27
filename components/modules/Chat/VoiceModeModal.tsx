import TalkingFaceIcon from '@/assets/icons/talking_face.svg';
import { api } from "@/lib/axios";
import { Feather, Ionicons } from '@expo/vector-icons';
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { speak, stop } from "@/lib/elevenlabsTTS";
import { useEffect, useRef, useState } from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming
} from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from "react-native-toast-message";

const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";

export const VoiceModeModal = ({
    visible,
    onClose,
    volume,
}: {
    visible: boolean;
    onClose: () => void;
    volume: any;
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const conversationId = useRef<number | null>(null);

    const recordingOptions: Audio.RecordingOptions = {
        android: {
            extension: ".wav",
            outputFormat: Audio.AndroidOutputFormat.DEFAULT,
            audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 256000,
        },
        ios: {
            extension: ".wav",
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 256000, // ✅ REQUIRED (THIS FIXES THE ERROR)
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: {},
    };


    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== "granted") {
                Toast.show({ type: "error", text1: "Mic permission required" });
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                recordingOptions,
                (status) => {
                    if (status.metering) {
                        volume.value = Math.max(0, 1 - status.metering / -160);
                    }
                },
                100
            );

            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.log("START RECORDING ERROR:", err);
            Toast.show({ type: "error", text1: "Failed to start recording" });
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsProcessing(true);

        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

            const uri = recording.getURI();
            setRecording(null);
            setIsRecording(false);
            volume.value = 0;

            if (!uri) return;

            const base64Audio = await FileSystem.readAsStringAsync(uri, {
                encoding: "base64",
            });

            const sttRes = await fetch(
                `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        config: {
                            encoding: "LINEAR16",
                            sampleRateHertz: 16000,
                            languageCode: "en-US",
                            enableAutomaticPunctuation: true,
                        },
                        audio: { content: base64Audio },
                    }),
                }
            );

            const sttData = await sttRes.json();
            const userText =
                sttData.results?.[0]?.alternatives?.[0]?.transcript ?? "";

            console.log("🎤 TRANSCRIBED TEXT:", userText);

            if (!userText) {
                Toast.show({ type: "error", text1: "Could not hear your voice" });
                return;
            }

            if (conversationId.current === null) {
                const convo = await api.post("/api/chat/conversations/", {
                    title: userText,
                });
                conversationId.current = convo.data.id;
            }

            const convoId = conversationId.current;
            if (convoId === null) return;

            await api.post(`/api/chat/conversations/${convoId}/messages/`, {
                content: userText,
            });

            let aiReply = "";
            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 800));
                const convo = await api.get(`/api/chat/conversations/${convoId}/`);
                if (convo.data.last_message?.role === "ai") {
                    aiReply = convo.data.last_message.content;
                    break;
                }
            }

            if (!aiReply) {
                Toast.show({ type: "error", text1: "AI did not respond" });
                return;
            }

            await stop();
            speak(aiReply);

        } catch (err) {
            console.log("VOICE CHAT ERROR:", err);
            Toast.show({ type: "error", text1: "Voice chat failed" });
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleRecording = async () => {
        isRecording ? stopRecording() : startRecording();
    };

    const handleClose = async () => {
        if (isRecording) await stopRecording();
        conversationId.current = null;
        volume.value = 0;
        onClose();
    };

    useEffect(() => {
        if (!visible && recording) stopRecording();
    }, [visible]);

    if (!visible) return null;

    const Wave = () => {
        const style = useAnimatedStyle(() => ({
            transform: [{
                scaleY: isRecording
                    ? withTiming(1 + volume.value, { duration: 120 })
                    : withTiming(1, { duration: 200 })
            }],
        }));

        return (
            <Animated.View
                style={style}
                className={`w-2 h-4 mx-1 rounded-full ${isRecording ? "bg-yellow-400" : "bg-gray-300"
                    }`}
            />
        );
    };

    return (
        <Modal animationType="fade" visible={visible}>
            <SafeAreaView className="flex-1 bg-white justify-between items-center py-10">

                <View className="items-center justify-center flex-1">
                    <View className="w-40 h-40">
                        <TalkingFaceIcon width="100%" height="100%" />
                    </View>

                    <Text className="text-gray-500 mt-10">
                        {isProcessing ? "Thinking..." : isRecording ? "Recording..." : "Tap mic"}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between w-full px-10 mb-5">
                    <TouchableOpacity
                        onPress={toggleRecording}
                        disabled={isProcessing}
                        className={`w-16 h-16 rounded-full justify-center items-center ${isRecording ? "bg-red-500" : "bg-white border border-gray-100"
                            }`}
                    >
                        <Feather name="mic" size={24} color={isRecording ? "white" : "#4B5563"} />
                    </TouchableOpacity>

                    <View className="flex-row items-end">
                        <Wave /><Wave /><Wave /><Wave /><Wave />
                    </View>

                    <TouchableOpacity
                        onPress={handleClose}
                        className="w-16 h-16 bg-white border border-gray-100 rounded-full justify-center items-center"
                    >
                        <Ionicons name="close" size={28} color="#4B5563" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};
