import CreateNewJournalModal from '@/components/modules/Home/Journal/CreateNewJournalModal';
import { JournalEntry, useJournal } from '@/hooks/useJournal';
import { api } from "@/lib/axios";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';




export default function JournalScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);


  const { entries, isLoading, refetch } = useJournal();
  // console.log("entries", entries)

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredEntries = entries.filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // console.log(JSON.stringify(entries, null, 2))
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await api.post(`/api/journal/entries/${entryId}/archive/`);
    },

    onMutate: async (entryId) => {
      // ✅ MUST MATCH useJournal queryKey
      await queryClient.cancelQueries({ queryKey: ["journals"] });

      const previousEntries =
        queryClient.getQueryData<JournalEntry[]>(["journals"]);

      queryClient.setQueryData<JournalEntry[]>(["journals"], (old = []) =>
        old.filter(entry => entry.id !== entryId)
      );

      return { previousEntries };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previousEntries) {
        queryClient.setQueryData(["journals"], ctx.previousEntries);
      }
    },
  });



  const formatRelativeTime = (date: any) => {
    const now = new Date();
    const dayCount = differenceInDays(now, date); // Get the difference in days directly

    // Convert days into months or weeks
    if (dayCount >= 30) {
      const monthCount = Math.floor(dayCount / 30);
      return `${monthCount} month${monthCount > 1 ? 's' : ''} ago`;
    } else if (dayCount >= 7) {
      const weekCount = Math.floor(dayCount / 7);
      return `${weekCount} week${weekCount > 1 ? 's' : ''} ago`;
    }

    // For days, use formatDistanceToNow
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const renderJournalEntry = ({ item }: { item: JournalEntry }) => (
    <View className="mb-6 relative">
      {/* Date */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center gap-2">
          <Feather name="calendar" size={16} color="#6B7280" />
          <Text className="text-gray-500 font-medium">
            {formatRelativeTime(new Date(item.created_at))}
          </Text>
        </View>

        {/* 3 DOTS */}
        <TouchableOpacity onPress={() =>
          setOpenMenuId(prev => (prev === item.id ? null : item.id))
        }>
          <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <Text className="text-gray-700 text-base leading-6 italic mb-5">
          {item.content}
        </Text>

        <View className="border border-yellow-300 rounded-xl p-4 bg-yellow-50/30">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="sparkles" size={18} color="#EAB308" />
            <Text className="text-yellow-500 font-bold text-sm">
              Ai insight
            </Text>
          </View>
          <Text className="text-gray-600 text-sm leading-5">
            {item.ai_insight}
          </Text>
        </View>
      </View>

      {/* 🔥 DROPDOWN MENU */}
      {openMenuId === item.id && (
        <View className="absolute top-8 right-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <TouchableOpacity
            onPress={() => {
              setOpenMenuId(null);
              archiveMutation.mutate(item.id);
            }}
            className="flex-row items-center gap-2 px-4 py-3"
          >
            <Ionicons name="archive-outline" size={18} color="#374151" />
            <Text className="text-gray-700 text-sm">Archive</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );


  return (
    <SafeAreaView className="flex-1 bg-gray-50/50">
      <StatusBar style="dark" />

      {/* HEADER */}
      <View className="flex-row items-center px-5 py-2 mb-4 gap-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 justify-center items-center">
          <Ionicons name="chevron-back" size={24} color="gray" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-white border border-gray-100 rounded-full px-4 h-14 shadow-sm">
          <TextInput
            placeholder="Search journals..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-800"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Feather name="search" size={20} color="#D1D5DB" />
        </View>
      </View>

      {/* LIST / LOADING STATE */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJournalEntry}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => setOpenMenuId(null)}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Text className="text-gray-400">No entries found.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        className="absolute bottom-20 right-6 w-14 h-14 bg-yellow-400 rounded-full justify-center items-center shadow-lg"
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>

      <CreateNewJournalModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}