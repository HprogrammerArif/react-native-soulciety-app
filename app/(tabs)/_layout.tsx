import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontAwesome } from '@expo/vector-icons';
import ChatIcon from '../../assets/icons/chat.svg';
import CommunityIcon from '../../assets/icons/community.svg';
import HomeIcon from '../../assets/icons/home.svg';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          height: insets.bottom + 75,   // ✅ add bottom inset
          paddingTop: 10,
          paddingBottom: insets.bottom, // ✅ safe area spacing
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#FCD34D',
        tabBarInactiveTintColor: '#CCCCCC',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 10,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <View className="w-6 h-6">
              <HomeIcon width="100%" height="100%" color={color} fill={color} stroke={color} />
            </View>
          ),
        }}
      />

      {/* CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <View className="w-6 h-6">
              <ChatIcon width="100%" height="100%" color={color} fill={color} stroke={color} />
            </View>
          ),
        }}
      />

      {/* COMMUNITY */}
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <View className="size-7">
              <CommunityIcon width="95%" height="95%" color={color} fill={color} stroke={color} />
            </View>
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View className="w-6 h-6">
              <FontAwesome name="user" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
