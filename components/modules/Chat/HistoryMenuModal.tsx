import { Feather, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export type ConversationHistory = {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    last_message: {
        id: number;
        role: "user" | "ai";
        content: string;
        created_at: string;
    } | null;
    message_count: number;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    history: ConversationHistory[];
    onSelect: (item: ConversationHistory) => void;
    onNewConversation: () => void;
    onDelete: (item: ConversationHistory) => void;
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });

export const HistoryMenuModal = ({
    visible,
    onClose,
    history,
    onSelect,
    onNewConversation,
    onDelete,
}: Props) => {
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        if (!visible) {
            setActiveMenuId(null);
            setSearchText("");
        }
    }, [visible]);

    const filteredHistory = history.filter((item) => {
        const query = searchText.trim().toLowerCase();

        if (!query) return true;

        return (
            item.title.toLowerCase().includes(query) ||
            item.last_message?.content.toLowerCase().includes(query)
        );
    });

    return (
        <Modal animationType="none" visible={visible} transparent>
            <View className="flex-1 flex-row">
                <View className="w-[85%] bg-white h-full pt-14 px-5 shadow-xl">

                    {/* SEARCH */}
                    <View className="flex-row items-center gap-3 mb-6">
                        <View className="flex-1 flex-row items-center bg-white border border-gray-200 rounded-full px-4 h-12">
                            <Feather name="search" size={20} color="#6B7280" />
                            <TextInput
                                placeholder="Search history"
                                className="flex-1 ml-2 text-base text-gray-800"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    {/* NEW CONVERSATION */}
                    <TouchableOpacity
                        onPress={onNewConversation}
                        className="flex-row items-center mb-8"
                    >
                        <Feather name="edit" size={20} color="#EAB308" />
                        <Text className="text-gray-700 font-medium ml-3 text-base">
                            New conversation
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-gray-500 font-medium mb-4">
                        Conversations
                    </Text>

                    {/* LIST */}
                    <FlatList
                        data={filteredHistory}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View className="mb-6">
                                <TouchableOpacity
                                    onPress={() => onSelect(item)}
                                    className="flex-row justify-between items-start"
                                >
                                    <View className="flex-1 pr-4">
                                        <Text
                                            className="text-gray-800 text-base font-medium mb-1"
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </Text>

                                        <View className="flex-row items-center gap-2">
                                            <Feather
                                                name="calendar"
                                                size={12}
                                                color="#9CA3AF"
                                            />
                                            <Text className="text-gray-400 text-xs">
                                                {formatDate(item.created_at)}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() =>
                                            setActiveMenuId(
                                                activeMenuId === item.id
                                                    ? null
                                                    : item.id
                                            )
                                        }
                                    >
                                        <SimpleLineIcons
                                            name="options-vertical"
                                            size={14}
                                            color="#9CA3AF"
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>

                                {/* DELETE ACTION */}
                                {activeMenuId === item.id && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setActiveMenuId(null);
                                            onDelete(item);
                                        }}
                                        className="mt-4 rounded-lg bg-red-500 py-3 px-5"
                                    >
                                        <Text className="text-white text-sm font-medium">
                                            Delete conversation
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                </View>

                {/* OVERLAY */}
                <TouchableOpacity
                    className="w-[15%] bg-black/20 h-full"
                    activeOpacity={1}
                    onPress={onClose}
                />
            </View>
        </Modal>
    );
};
