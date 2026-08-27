import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

export default function Header({ users, selectedUserId, handleAvatarPress, setActiveTab, setSelectedUserId, activeTab }: any) {

    return (
        <View className="bg-white pb-2">
            <Text className="text-lg font-bold px-5 mt-4 mb-3">Following</Text>

            {/* Avatar Horizontal List */}
            <FlatList
                horizontal
                data={users}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item }) => {
                    const isSelected = selectedUserId === item.id;
                    return (
                        <TouchableOpacity
                            onPress={() => handleAvatarPress(item.id)}
                            className="mr-5 items-center"
                        >
                            <View className={`rounded-full p-[2px] ${isSelected ? 'border-2 border-yellow-400' : 'border-0'}`}>
                                <Image
                                    source={{ uri: item.profile_picture_url }}
                                    className="w-16 h-16 rounded-full"
                                />
                            </View>
                            <Text className="text-xs text-gray-600 mt-1 font-medium">{item.full_name}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Filter Tabs */}
            <View className="flex-row px-5 mt-6 gap-6">
                {['All', 'Following', 'My'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => {
                            setActiveTab(tab as any);
                            if (tab === 'All') setSelectedUserId(null); // Reset filter
                        }}
                        className={`border-b-2 pb-1 ${activeTab === tab ? 'border-yellow-400' : 'border-transparent'}`}
                    >
                        <Text className={`font-medium ${activeTab === tab ? 'text-black' : 'text-gray-400'}`}>
                            {tab === "Following" && "Followers"}
                            {tab === "All" && "All"}
                            {tab === "My" && "My Posts"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}