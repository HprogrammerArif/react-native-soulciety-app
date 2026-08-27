import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";


const journals = [
    {
        id: "1",
        date: "Nov 18, 2026",
        entry:
            "Today I felt a deep sense of gratitude for the simple things. The morning sunrise reminded me that every day is a new beginning. I'm learning to let go of what no longer serves me.",
        insight:
            "Beautiful reflection! Your awareness of life's simple gifts shows spiritual growth. This practice of gratitude and release is powerful. Consider exploring what you're ready to welcome into the space you're creating.",
    },
    {
        id: "2",
        date: "Nov 18, 2026",
        entry:
            "Today I felt a deep sense of gratitude for the simple things. The morning sunrise reminded me that every day is a new beginning. I'm learning to let go of what no longer serves me.",
        insight:
            "Beautiful reflection! Your awareness of life's simple gifts shows spiritual growth. This practice of gratitude and release is powerful. Consider exploring what you're ready to welcome into the space you're creating.",
    },
];

export default function JournalArchiveScreen() {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: archivedJournals = [], isLoading } = useQuery({
        queryKey: ["archivedJournals"],
        queryFn: async () => {
            const res = await api.get("/api/journal/archived/");
            return res.data ?? [];
        },
    });

    const unarchiveMutation = useMutation({
        mutationFn: async (entryId: string) => {
            await api.post(`/api/journal/entries/${entryId}/archive/`);
        },

        // 🔥 Optimistic remove from archive list
        onMutate: async (entryId) => {
            await queryClient.cancelQueries({ queryKey: ["archivedJournals"] });

            const previous =
                queryClient.getQueryData<any[]>(["archivedJournals"]);

            queryClient.setQueryData<any[]>(["archivedJournals"], (old = []) =>
                old.filter(entry => entry.id !== entryId)
            );

            return { previous };
        },

        // ❌ rollback if error
        onError: (_e, _id, ctx) => {
            if (ctx?.previous) {
                queryClient.setQueryData(["archivedJournals"], ctx.previous);
            }
        },

        // ✅ keep main journal list in sync
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["journals"] });
        },
    });



    return (
        <SafeAreaView
            className="flex-1 bg-white"
        >
            {/* Header */}
            <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
                    <Ionicons name="chevron-back" size={22} color="black" />
                </TouchableOpacity>

                <Text className="flex-1 text-center text-lg font-bold">
                    Journal Archive
                </Text>


            </View>

            {isLoading && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400">Loading archived journals...</Text>
                </View>
            )}

            {!isLoading && archivedJournals.length === 0 && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-400">No archived journals</Text>
                </View>
            )}


            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {archivedJournals.map((item: any) => (
                    <View key={item.id} className="px-5 mt-6 relative">

                        {/* Header row */}
                        <View className="items-center justify-between w-full flex-row">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Feather name="calendar" size={16} color="#6B7280" />
                                <Text className="text-gray-600 text-sm">
                                    {new Date(item.created_at).toDateString()}
                                </Text>
                            </View>

                            {/* 3 dots */}
                            <TouchableOpacity
                                onPress={() =>
                                    setOpenMenuId(prev => (prev === item.id ? null : item.id))
                                }
                                className="p-2"
                            >
                                <Feather name="more-vertical" size={18} color="black" />
                            </TouchableOpacity>
                        </View>

                        {/* Card */}
                        <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                            <Text className="text-gray-800 leading-6 italic mb-4">
                                {item.content}
                            </Text>

                            {item.has_insight && (
                                <View className="p-4 border border-yellow-300 bg-yellow-50 rounded-2xl mt-2">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Ionicons name="sparkles" size={16} color="#EAB308" />
                                        <Text className="text-yellow-600 font-bold text-sm">
                                            Ai insight
                                        </Text>
                                    </View>
                                    <Text className="text-gray-700 leading-6">
                                        {item.ai_insight}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* 🔥 Dropdown menu */}
                        {openMenuId === item.id && (
                            <View className="absolute top-10 right-6 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                <TouchableOpacity
                                    onPress={() => {
                                        setOpenMenuId(null);
                                        unarchiveMutation.mutate(item.id);
                                    }}
                                    className="flex-row items-center gap-2 px-4 py-3"
                                >
                                    <Ionicons name="arrow-undo-outline" size={18} color="#374151" />
                                    <Text className="text-gray-700 text-sm">
                                        Unarchive
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

        </SafeAreaView>
    );
}
