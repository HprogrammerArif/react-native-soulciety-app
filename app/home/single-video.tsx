import { api } from "@/lib/axios";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VideoDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { id } = useLocalSearchParams(); // This updates when we call setParams
  // const [isBookmarked, setIsBookmarked] = useState(false);

  // 1. Fetch Video Detail (Refetch happens automatically when 'id' changes)
  const {
    data: video,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const res = await api.get(`/api/spiritual/videos/${id}/`);
      return res.data;
    },
    enabled: !!id, // Only run if ID exists
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await api.get("/api/spiritual/videos/bookmarks/");
      return res.data ?? [];
    },
  });

  const isBookmarked = bookmarks.some((item: any) => item.id === Number(id));

  // 2. Fetch Suggested Videos
  const { data: suggestedData } = useQuery({
    queryKey: ["suggestedVideos"],
    queryFn: async () => {
      const res = await api.get("/api/spiritual/videos/suggested/");
      return res.data ?? [];
    },
  });

  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/api/spiritual/videos/${id}/bookmark/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },

    // 🔥 Optimistic UI
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["video", id] });

      const previousVideo = queryClient.getQueryData<any>(["video", id]);

      queryClient.setQueryData(["video", id], (old: any) => ({
        ...old,
        is_bookmarked: !old.is_bookmarked,
      }));

      return { previousVideo };
    },

    // ❌ Rollback if failed
    onError: (_err, _vars, context) => {
      if (context?.previousVideo) {
        queryClient.setQueryData(["video", id], context.previousVideo);
      }
    },

  });

  // Handle the click on a suggested video
  const handleSelectVideo = (newVideoId: number) => {
    // This updates the URL 'id' param, which triggers the 'video' query to refresh
    router.setParams({ id: newVideoId.toString() });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#EAB308" />
      </View>
    );
  }

  const renderSuggestedItem = ({ item }: { item: any }) => {
    const suggested = item.video; // Access nested object from your response
    return (
      <TouchableOpacity
        className="flex-row mb-4 bg-white"
        onPress={() => handleSelectVideo(suggested.id)} // CLICK HANDLER
      >
        <View className="relative w-40 h-24 rounded-xl overflow-hidden mr-3 bg-gray-100">
          <Image
            source={{ uri: suggested.thumbnail_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="flex-1 justify-center">
          <Text
            className="text-sm font-bold text-gray-900 mb-1"
            numberOfLines={2}
          >
            {suggested.title}
          </Text>
          <Text className="text-gray-400 text-xs">Recommended</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* --- VIDEO PLAYER --- */}
      <View className="w-full h-64 bg-black relative">
        {/* If fetching new data, show a small overlay loader on the player */}
        {isFetching && !isLoading && (
          <View className="absolute inset-0 z-20 justify-center items-center bg-black/40">
            <ActivityIndicator color="white" />
          </View>
        )}

        {video?.video_url ? (
          <Video
            key={video.id} // Adding a key forces the component to remount when ID changes
            source={{ uri: video.video_url }}
            useNativeControls
            shouldPlay
            resizeMode={ResizeMode.CONTAIN}
            style={{ width: "100%", height: "100%" }}
            usePoster
            posterSource={{ uri: video.thumbnail_url }}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white">Video path error</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ top: insets.top + 10 }}
          className="absolute left-4 z-30 w-10 h-10 bg-black/40 rounded-full justify-center items-center"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* --- SCROLLABLE CONTENT --- */}
      <View className="flex-1">
        <FlatList
          data={suggestedData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSuggestedItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListHeaderComponent={() => (
            <View className="mt-5 mb-6">
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-xl font-extrabold text-gray-900 flex-1 mr-4">
                  {video?.title}
                </Text>
                <TouchableOpacity
                  onPress={() => bookmarkMutation.mutate()}
                  disabled={bookmarkMutation.isLoading}
                >
                  <FontAwesome
                    name={isBookmarked ? "bookmark" : "bookmark-o"}
                    size={22}
                    color={isBookmarked ? "#EAB308" : "black"}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsDescriptionExpanded((prev) => !prev)}
              >
                <Text
                  className="text-gray-600 text-sm leading-5"
                  numberOfLines={isDescriptionExpanded ? undefined : 3}
                >
                  {video?.description}
                </Text>

                {video?.description?.length > 120 && (
                  <Text className="mt-1 text-xs font-semibold text-yellow-500">
                    {isDescriptionExpanded ? "Show less" : "Read more"}
                  </Text>
                )}
              </TouchableOpacity>

              <View className="h-[1px] bg-gray-100 my-6" />
              <Text className="text-lg font-bold text-gray-800 mb-4">
                Up Next
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}
