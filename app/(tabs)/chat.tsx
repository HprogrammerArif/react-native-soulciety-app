import MenuIcon from '@/assets/icons/menu.svg';
import { HistoryMenuModal } from '@/components/modules/Chat/HistoryMenuModal';
import { MarkdownText } from '@/components/modules/Chat/MarkdownText';
import { VoiceModeModal } from '@/components/modules/Chat/VoiceModeModal';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from "react-native-toast-message";

import { api } from "@/lib/axios";



// --- TYPES ---
export type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    backendId?: number;
    isError?: boolean;
    pending?: boolean;
};

export type ConversationHistory = {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    last_message: {
        id: number;
        role: 'user' | 'ai';
        content: string;
        created_at: string;
    } | null;
    message_count: number;
};

type BackendMessage = {
    id: number;
    role: 'user' | 'ai';
    content: string;
    created_at: string;
};

type PaginatedMessagesResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: BackendMessage[];
};

type SendMessageResponse = {
    message: string;
    user_message: BackendMessage;
    ai_thinking: boolean;
};

// --- TYPING INDICATOR COMPONENT ---
function TypingIndicator() {
    const scale1 = useSharedValue(0.8);
    const scale2 = useSharedValue(0.8);
    const scale3 = useSharedValue(0.8);

    useEffect(() => {
        scale1.value = withRepeat(
            withTiming(1.2, { duration: 600 }),
            -1,
            true
        );

        const timeout2 = setTimeout(() => {
            scale2.value = withRepeat(
                withTiming(1.2, { duration: 600 }),
                -1,
                true
            );
        }, 100);

        const timeout3 = setTimeout(() => {
            scale3.value = withRepeat(
                withTiming(1.2, { duration: 600 }),
                -1,
                true
            );
        }, 200);

        return () => {
            clearTimeout(timeout2);
            clearTimeout(timeout3);
        };
    }, [scale1, scale2, scale3]);

    const style1 = useAnimatedStyle(() => ({
        transform: [{ scale: scale1.value }],
    }));

    const style2 = useAnimatedStyle(() => ({
        transform: [{ scale: scale2.value }],
    }));

    const style3 = useAnimatedStyle(() => ({
        transform: [{ scale: scale3.value }],
    }));

    return (
        <View className="mb-6 items-start">
            <View className="flex-row items-center gap-2 mb-1.5 ml-1">
                <Ionicons name="sparkles" size={16} color="#EAB308" />
                <Text className="text-yellow-500 font-bold text-sm">
                    Soulciety AI
                </Text>
            </View>

            <View className="flex-row items-center gap-2 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm p-4">
                <Animated.View
                    style={[
                        style1,
                        {
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#6B7280',
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        style2,
                        {
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#6B7280',
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        style3,
                        {
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#6B7280',
                        },
                    ]}
                />
            </View>
        </View>
    );
}

export default function ChatScreen() {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [history, setHistory] = useState<ConversationHistory[]>([]);
    const [dailyLimitReached, setDailyLimitReached] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const conversationId = useRef<number | null>(null);

    const insets = useSafeAreaInsets();
    const volume = useSharedValue(0);

    const getHistory = async () => {
        const res = await api.get("/api/chat/conversations/");
        setHistory(res.data);
    };


    useEffect(() => {
        if (isMenuVisible) {
            getHistory();
        }
    }, [isMenuVisible]);


    const handleSelectConversation = async (item: ConversationHistory) => {
        try {
            conversationId.current = item.id;

            // 1️⃣ Fetch full message history
            const backendMessages = await getConversationMessages(item.id);

            // 2️⃣ Map backend → UI messages
            const mappedMessages: Message[] = backendMessages.map((msg) => ({
                id: msg.id.toString(),
                text: msg.content,
                sender: msg.role,
                backendId: msg.id,
            }));

            // 3️⃣ Set messages
            setMessages(mappedMessages);

            // 4️⃣ Close menu
            setIsMenuVisible(false);

        } catch {
            Toast.show({
                type: "error",
                text1: "Failed to load conversation",
            });
        }
    };

    const deleteConversation = async (convoId: number) => {
        await api.delete(`/api/chat/conversations/${convoId}/`);
    };

    const handleDeleteConversation = async (item: ConversationHistory) => {
        try {
            await deleteConversation(item.id);

            // Remove from history list
            setHistory(prev => prev.filter(c => c.id !== item.id));

            // If deleting active conversation → reset chat
            if (conversationId.current === item.id) {
                conversationId.current = null;
                setMessages([]);
                setInputText("");
            }

            Toast.show({
                type: "success",
                text1: "Conversation deleted",
            });

        } catch {
            Toast.show({
                type: "error",
                text1: "Failed to delete conversation",
            });
        }
    };




    const handleNewConversation = () => {
        conversationId.current = null;   // 🔑 reset backend conversation
        setMessages([]);                 // 🔑 show welcome state
        setInputText("");
        setIsMenuVisible(false);
    };



    /* ================= API HELPERS ================= */

    const createConversation = async () => {
        const res = await api.post("/api/chat/conversations/");
        return res.data;
    };

    const sendMessage = async (convoId: number, content: string) => {
        const res = await api.post<SendMessageResponse>(
            `/api/chat/conversations/${convoId}/messages/`,
            { content }
        );

        return res.data;
    };

    const getConversationMessages = async (convoId: number) => {
        let nextUrl: string | null = `/api/chat/conversations/${convoId}/messages/`;
        const allMessages: BackendMessage[] = [];

        while (nextUrl) {
            const res: any = await api.get<PaginatedMessagesResponse>(nextUrl);
            allMessages.push(...res.data.results);
            nextUrl = res.data.next;
        }

        return allMessages;
    };

    const getLatestMessage = async (convoId: number) => {
        const res = await api.get(`/api/chat/conversations/${convoId}/messages/latest/`);

        if (!res.data?.id) {
            return null;
        }

        return res.data as BackendMessage;
    };


    /* ================= SEND MESSAGE ================= */

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || inputText;
        if (!textToSend.trim() || isThinking) return;

        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}

        const optimisticMessageId = `temp_${Date.now()}`;
        const userMsg: Message = {
            id: optimisticMessageId,
            text: textToSend,
            sender: 'user',
            pending: true,
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        Keyboard.dismiss();
        setIsThinking(true);

        let didAcceptMessage = false;
        let confirmedUserMessage: BackendMessage | null = null;

        try {
            // 1️⃣ Create conversation once
            if (conversationId.current === null) {
                const convo = await createConversation();
                conversationId.current = convo.id;
            }

            const convoId = conversationId.current;
            if (convoId === null) throw new Error("Conversation missing");
            const previousLatestBackendId =
                messages.length > 0 ? messages[messages.length - 1]?.backendId ?? null : null;

            // 2️⃣ Send message
            const sendRes = await sendMessage(convoId, textToSend);
            confirmedUserMessage = sendRes.user_message;
            didAcceptMessage = true;

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === optimisticMessageId
                        ? {
                            ...msg,
                            id: confirmedUserMessage?.id.toString() ?? msg.id,
                            backendId: confirmedUserMessage?.id,
                            pending: false,
                        }
                        : msg
                )
            );
            setDailyLimitReached(false);

            // 3️⃣ Poll for AI reply
            let aiMessage: BackendMessage | null = null;
            for (let i = 0; i < 15; i++) {
                await new Promise(r => setTimeout(r, 800));
                const latestMessage = await getLatestMessage(convoId);

                if (
                    latestMessage?.role === "ai" &&
                    latestMessage.id !== confirmedUserMessage?.id &&
                    latestMessage.id !== previousLatestBackendId
                ) {
                    aiMessage = latestMessage;
                    break;
                }
            }

            if (!aiMessage) throw new Error("AI timeout");

            const aiMsg: Message = {
                id: aiMessage.id.toString(),
                text: aiMessage.content,
                sender: 'ai',
                backendId: aiMessage.id,
            };

            setMessages(prev => {
                if (prev.some(msg => msg.backendId === aiMsg.backendId)) {
                    return prev;
                }

                return [...prev, aiMsg];
            });
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            getHistory().catch(() => null);

        } catch (err: any) {
            setIsThinking(false);

            const status = err?.response?.status;
            const errorData = err?.response?.data;

            if (!didAcceptMessage) {
                setMessages(prev => prev.filter(msg => msg.id !== optimisticMessageId));
                setInputText(textToSend);
            }

            if (status === 429) {
                const errorTitle = "Daily message limit reached";
                const errorMsg =
                    "You can send up to 10 AI messages per day. Please try again tomorrow.";

                setDailyLimitReached(true);

                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + "_error",
                        text: errorMsg,
                        sender: 'ai',
                        isError: true,
                    }
                ]);

                Toast.show({
                    type: "error",
                    text1: errorTitle,
                    text2: errorMsg,
                    visibilityTime: 4000,
                    position: 'top',
                });
            } else {
                const fallbackMsg =
                    errorData?.detail ||
                    errorData?.error ||
                    err?.message ||
                    "AI response failed";

                Toast.show({
                    type: "error",
                    text1: didAcceptMessage ? "Message sent, reply still pending" : "AI response failed",
                    text2: fallbackMsg,
                });
            }
        } finally {
            setIsThinking(false);
        }
    };

    /* ================= AUTO SCROLL ================= */

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    /* ================= UI RENDER ================= */

    const renderWelcomeState = () => (
        <View className="flex-1 px-5 justify-end pb-10">
            {/* AI Disclaimer */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
                <Text className="text-yellow-800 text-xs leading-5 text-center">
                    Soulciety AI is for spiritual guidance and personal reflection only. It is not a substitute for professional medical, psychological, or psychiatric advice.
                </Text>
            </View>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                    handleSend(
                        "I release what no longer serves me and welcome miracles into my life."
                    )
                }
                className="bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm"
            >
                <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="sparkles" size={18} color="#EAB308" />
                    <Text className="text-yellow-500 font-bold text-sm">
                        Today&apos;s Affirmation
                    </Text>
                </View>
                <Text className="text-gray-700 text-base leading-6">
                    I release what no longer serves me and welcome miracles into my life.
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSend("I'm ready to start my spiritual journey.")}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm"
            >
                <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons name="sparkles" size={18} color="#EAB308" />
                    <Text className="text-yellow-500 font-bold text-sm">
                        Soulciety AI
                    </Text>
                </View>
                <Text className="text-gray-700 text-base leading-6">
                    Welcome 🌿 I&apos;m here to guide you on your spiritual journey.
                    How are you feeling today?
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderMessageItem = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        const isErrorMsg = item.isError;

        return (
            <View className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && (
                    <View className="flex-row items-center gap-2 mb-1.5 ml-1">
                        <Ionicons name="sparkles" size={16} color="#EAB308" />
                        <Text className="text-yellow-500 font-bold text-sm">
                            Soulciety AI
                        </Text>
                    </View>
                )}

                <View
                    className={`max-w-[85%] p-4 rounded-2xl ${isErrorMsg
                            ? 'bg-red-50 border border-red-300 rounded-br-none'
                            : isUser
                                ? 'bg-gray-100 rounded-br-none'
                                : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'
                        }`}
                >
                    {!isUser ? (
                        <MarkdownText
                            text={item.text}
                            className={`text-base leading-6 font-medium ${isErrorMsg ? 'text-red-600' : 'text-gray-800'
                                }`}
                        />
                    ) : (
                            <Text className={`text-base leading-6 font-medium ${isErrorMsg ? 'text-red-600' : 'text-gray-800'
                                }`}>
                                {item.text}
                            </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* HEADER */}
            <View
                className="flex-row items-center px-5 py-3 border-b border-gray-50 bg-white"
                style={{
                    paddingTop: insets.top + 10,
                }}
            >
                <TouchableOpacity
                    onPress={() => setIsMenuVisible(true)}
                    className="w-11 h-11 bg-gray-100 rounded-full justify-center items-center mr-3"
                    accessibilityRole="button"
                    accessibilityLabel="Chat menu and conversation history"
                >
                    <MenuIcon color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-black">Soulciety AI</Text>
            </View>

            {/* CHAT */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
            >
                {messages.length === 0 ? (
                    renderWelcomeState()
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessageItem}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingVertical: 20,
                            paddingBottom: 40,
                        }}
                        className="flex-1 bg-gray-50/30"
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={isThinking ? <TypingIndicator /> : null}
                    />
                )}

                {/* DAILY LIMIT BANNER */}
                {dailyLimitReached && (
                    <View className="bg-amber-50 px-5 py-2.5 border-t border-amber-200 flex-row items-center gap-2">
                        <Ionicons name="information-circle" size={18} color="#D97706" />
                        <Text className="text-amber-800 text-xs font-medium flex-1">
                            Daily limit reached (10 messages). Resets tomorrow.
                        </Text>
                    </View>
                )}

                {/* INPUT BAR */}
                <View className="px-5 py-4 bg-white border-t border-gray-50 flex-row items-center gap-3">
                    <TextInput
                        className="flex-1 bg-gray-100 h-14 rounded-full px-5 text-base text-gray-800"
                        placeholder={dailyLimitReached ? "Daily limit reached" : "Ask Soulciety AI..."}
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        returnKeyType="send"
                        onSubmitEditing={() => handleSend()}
                        editable={!dailyLimitReached}
                        accessibilityLabel="Message input field"
                    />

                    <TouchableOpacity
                        onPress={() => handleSend()}
                        disabled={dailyLimitReached || isThinking || !inputText.trim()}
                        accessibilityRole="button"
                        accessibilityLabel="Send message"
                        className={`w-12 h-12 rounded-full justify-center items-center ${
                            dailyLimitReached || isThinking || !inputText.trim()
                                ? 'bg-gray-300'
                                : 'bg-yellow-400'
                        }`}
                    >
                        <Ionicons name="arrow-up" size={24} color={dailyLimitReached || isThinking || !inputText.trim() ? '#9CA3AF' : 'black'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>



            {/* MODALS */}
            <VoiceModeModal
                visible={isVoiceMode}
                onClose={() => setIsVoiceMode(false)}
                volume={volume}
            />

            <HistoryMenuModal
                visible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                history={history}
                onSelect={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDelete={handleDeleteConversation}
            />


        </View>
    );
}
