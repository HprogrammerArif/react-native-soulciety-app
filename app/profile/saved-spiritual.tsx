import api from "@/lib/axios";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const data = [
  {
    id: "1",
    title: "Lorem ipsum dolo",
    desc: "Lorem ipsum dolor sit amet consectetur. Interdum ut vel..",
    time: "9 min",
    image:
      "https://images.pexels.com/photos/1558732/pexels-photo-1558732.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "2",
    title: "Lorem ipsum dolo",
    desc: "Lorem ipsum dolor sit amet consectetur. Interdum ut vel..",
    time: "9 min",
    image:
      "https://images.pexels.com/photos/7135120/pexels-photo-7135120.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "3",
    title: "Lorem ipsum dolo",
    desc: "Lorem ipsum dolor sit amet consectetur. Interdum ut vel..",
    time: "9 min",
    image:
      "https://images.pexels.com/photos/7130498/pexels-photo-7130498.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "4",
    title: "Lorem ipsum dolo",
    desc: "Lorem ipsum dolor sit amet consectetur. Interdum ut vel..",
    time: "9 min",
    image:
      "https://images.pexels.com/photos/2943603/pexels-photo-2943603.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "5",
    title: "Lorem ipsum dolo",
    desc: "Lorem ipsum dolor sit amet consectetur. Interdum ut vel..",
    time: "9 min",
    image:
      "https://images.pexels.com/photos/3182761/pexels-photo-3182761.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export default function SavedSpiritualScreen() {
  const insets = useSafeAreaInsets();

  const { data: savedVideos = [], isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await api.get("/api/spiritual/videos/bookmarks/");
      return res.data ?? [];
    },
  });

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      className="flex-row items-start gap-4 py-4 border-b border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/home/single-video",
          params: { id: item.id },
        })
      }
    >
      {/* Left Image */}
      <View className="relative">
        <Image
          source={{ uri: item.thumbnail_url }}
          className="w-28 h-[60px] rounded-xl"
        />

        {/* Time Badge */}
        {item.duration_formatted && (
          <View className="absolute bottom-1 right-1 bg-black/70 px-2 py-1 rounded-md">
            <Text className="text-white text-xs">
              {item.duration_formatted}
            </Text>
          </View>
        )}
      </View>

      {/* Text Content */}
      <View className="flex-1">
        <Text className="font-semibold text-base text-gray-900">
          {item.title}
        </Text>
        <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Bookmark Icon */}
      <Ionicons name="bookmark" size={20} color="#FACC15" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center items-center"
        >
          <Ionicons name="chevron-back" size={22} color="black" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold">
          Saved Spiritual
        </Text>

        <View className="w-10" />
      </View>

      {/* List */}
      <FlatList
        data={savedVideos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center py-20 px-6">
              <Ionicons name="bookmark-outline" size={64} color="#D1D5DB" />
              <Text className="text-lg font-semibold text-gray-800 mt-4">
                No Saved Meditations
              </Text>
              <Text className="text-sm text-gray-500 mt-2 text-center">
                You haven't saved any spiritual content yet. Bookmark your favorite meditations to access them here.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
