import { api } from "@/lib/axios";
import { Feather, Ionicons, Octicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SpiritualScreen() {
  const router = useRouter();

  // States
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Search Debounce: Wait 500ms after typing stops to fetch
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 1. Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/api/spiritual/categories/");
      return res.data;
    },
  });

  // 2. Fetch Videos (Dynamic based on Category & Search)
  const {
    data: videos = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["videos", activeCategory, debouncedSearch],
    queryFn: async () => {
      const categoryParam =
        activeCategory === "All" ? "" : activeCategory.toLowerCase();

      try {
        const res = await api.get("/api/spiritual/videos/", {
          params: {
            category: categoryParam,
            search: debouncedSearch,
          },
        });

        return res.data ?? [];
      } catch (error: any) {
        console.log(
          "❌ Videos fetch error:",
          error?.response?.data || error.message,
        );
        return []; // ✅ ALWAYS RETURN
      }
    },
  });

  // console.log(videos);

  // --- OPTIMIZED RENDER ITEM ---
  const renderVideoCard = useCallback(
    ({ item }: { item: any }) => (
      <View className="mb-8 bg-white rounded-2xl overflow-hidden w-full">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            router.push({
              pathname: "/home/single-video",
              params: { id: item.id },
            })
          }
          className="relative w-full h-52 bg-gray-200 rounded-3xl overflow-hidden"
        >
          <Image
            source={{ uri: item.thumbnail_url }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Play Button Overlay */}
          <View className="absolute inset-0 justify-center items-center bg-black/10">
            <View className="w-14 h-14 bg-white/30 rounded-full justify-center items-center backdrop-blur-md border border-white/40">
              <Ionicons
                name="play"
                size={24}
                color="white"
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>

          {item.duration_formatted && (
            <View className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded-lg">
              <Text className="text-white text-[10px] font-bold">
                {item.duration_formatted}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="mt-3 px-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {item.title}
          </Text>
          <Text className="text-gray-500 text-sm leading-5" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
    ),
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 px-5">
        {/* HEADER */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-xl justify-center items-center border border-gray-100"
          >
            <Ionicons name="chevron-back" size={22} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black">Spiritual</Text>
          <TouchableOpacity className="w-10 h-10 justify-center items-center">
            {/* <Octicons name="history" size={20} color="black" /> */}
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 h-12 mb-6">
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search meditations..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-800 ml-3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CATEGORY FILTERS */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Hardcoded All Category */}
            <TouchableOpacity
              onPress={() => setActiveCategory("All")}
              className={`px-6 py-2.5 rounded-full mr-3 border ${activeCategory === "All"
                  ? "bg-yellow-400 border-yellow-400"
                  : "bg-white border-gray-200"
                }`}
            >
              <Text
                className={`font-bold ${activeCategory === "All" ? "text-black" : "text-gray-500"}`}
              >
                All
              </Text>
            </TouchableOpacity>

            {categories?.map((cat: any) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.name)} // Display name can be Capitalized
                className={`px-6 py-2.5 rounded-full mr-3 border ${activeCategory === cat.name
                    ? "bg-yellow-400 border-yellow-400"
                    : "bg-white border-gray-200"
                  }`}
              >
                <Text
                  className={`font-bold ${activeCategory === cat.name ? "text-black" : "text-gray-500"}`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CONTENT LIST */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="#EAB308" size="large" />
          </View>
        ) : (
          <FlatList
              data={videos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderVideoCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center py-20 px-6">
                  <Ionicons name="videocam-outline" size={64} color="#D1D5DB" />
                  <Text className="text-lg font-semibold text-gray-800 mt-4">
                    {searchQuery
                      ? 'No videos found'
                      : 'No spiritual content available'}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-2 text-center">
                    {searchQuery
                      ? 'Try adjusting your search or filters'
                      : 'Check back later for new content'}
                  </Text>
                </View>
              }
              // SWIPE DOWN TO REFETCH
              refreshControl={
                <RefreshControl
                  refreshing={isFetching}
                  onRefresh={refetch}
                  tintColor="#EAB308"
                />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
