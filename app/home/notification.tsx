import api from "@/lib/axios";
import { Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns"; // for relative time formatting
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Notification Data Type
type NotificationData = {
  type: string; // Can be 'journal', 'task', etc.
  entry_id: string; // ID of the journal entry or related data
};

type Notification = {
  id: number; // Unique ID of the notification
  notification_type: string; // Type of notification, e.g., 'journal_insight'
  title: string; // Title of the notification
  message: string; // The actual notification message
  is_read: boolean; // Whether the notification has been read or not
  created_at: string; // Date and time when the notification was created, in ISO string format
  data: NotificationData; // Additional data associated with the notification
  time: string; // Time description like "2 hr ago"
};

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Query Client to refetch after marking a notification as read
  const { data: notifications, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await api.get(`/api/notifications/?unread=${activeTab === "unread"}`);
        return res.data.notifications ?? [];
      } catch (error) {
        console.log(error);
        return []; // Return an empty array in case of error
      }
    },
  });

  // Filter notifications based on active tab
  const filtered = activeTab === "all" ? notifications : notifications?.filter((notification: any) => !notification.is_read);

  // Function to format the date to "1 minute ago", "3 days ago", etc.
  const formatRelativeDate = (createdAt: string) => {
    const date = new Date(createdAt);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read on click
    if (!notification.is_read) {
      try {
        const res = await api.post(`/api/notifications/${notification.id}/read/`);
        console.log(res.data);

        // Refetch notifications to update the UI after marking as read
        refetch();
      } catch (error) {
        console.log(error);
      }
    }

    // Navigate to the journal if the type is "journal"
    if (notification.data.type === "journal") {
      router.push("/home/journal");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
          <Ionicons name="chevron-back" size={22} color="black" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold">Notification</Text>

        <View className="w-10" />
      </View>

      {/* Tabs */}
      <View className="flex-row px-5 mt-4 gap-3">
        <TouchableOpacity
          onPress={() => setActiveTab("all")}
          className={`px-5 py-2 rounded-full ${activeTab === "all" ? "bg-yellow-400" : "bg-gray-100"}`}
        >
          <Text className={`font-semibold ${activeTab === "all" ? "text-white" : "text-gray-600"}`}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("unread")}
          className={`px-5 py-2 rounded-full ${activeTab === "unread" ? "bg-yellow-400" : "bg-gray-100"}`}
        >
          <Text className={`font-semibold ${activeTab === "unread" ? "text-white" : "text-gray-600"}`}>Unread</Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <ScrollView
        className="mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* If no notifications */}
        {filtered?.length === 0 ? (
          <Text className="text-center text-gray-500 mt-5">No notifications yet.</Text>
        ) : (
          filtered?.map((item: Notification) => (
            <TouchableOpacity
              onPress={() => handleNotificationClick(item)}
              key={item.id}
              className="px-5 mb-5"
            >
              {/* Time */}
              <Text className="text-gray-400 text-sm font-semibold mb-2">• {formatRelativeDate(item.created_at)}</Text>
              <View className={`flex-row items-start gap-3 ${item.is_read ? "bg-gray-100 border-gray-100" : "bg-yellow-50/40 border-yellow-100"} border  rounded-2xl p-4`}>
                {/* Icon */}
                <View className="w-10 h-10 bg-yellow-400 rounded-full justify-center items-center">
                  {item.data.type === "journal" ? (
                    <Octicons name="sparkles-fill" size={16} color="black" />
                  ) : item.notification_type === "community_activity" ? (
                    <MaterialCommunityIcons name="account-group" size={22} color="black" />
                  ) : (
                    <Ionicons name="book" size={22} color="black" />
                  )}
                </View>

                {/* Text */}
                <View className="flex-1">
                  <Text className="font-semibold text-base text-gray-900">{item.title}</Text>
                  <Text className="text-gray-600 mt-1 leading-5">{item.message}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
