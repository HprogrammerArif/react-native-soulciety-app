import CreatePostModal from '@/components/modules/Community/CreatePostModal';
import Header from '@/components/modules/Community/Header';
import PostCard from '@/components/modules/Community/PostCard';
import { useCommunity } from '@/hooks/useCommunity';
import { useUser } from '@/hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CommunityScreen() {
    const [activeTab, setActiveTab] = useState<'All' | 'Following' | 'My'>('All');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { profile } = useUser();
    const { posts, followingList, isLoading, isCreating, createPost, followUser, refetch } = useCommunity(activeTab);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // console.log("posts", JSON.stringify(posts, null, 2))

    const filteredPosts = selectedUserId
        ? posts.filter((post: any) => post.user.id === selectedUserId)
        : posts;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#EAB308" size="large" />
                </View>
            ) : (
                <FlatList
                    data={filteredPosts}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <PostCard
                                item={item}
                                users={followingList} // REAL DYNAMIC LIST
                                onFollowPress={followUser}
                                profileEmail={profile?.data?.email}
                            />
                        )}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListHeaderComponent={
                            <Header
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                users={followingList} // REAL DYNAMIC LIST FOR HEADER
                                selectedUserId={selectedUserId}
                                setSelectedUserId={setSelectedUserId}
                                handleAvatarPress={(id: string) => setSelectedUserId(prev => prev === id ? null : id)}
                            />
                        }
                        ListEmptyComponent={
                            !isLoading ? (
                                <View className="flex-1 items-center justify-center py-20 px-6">
                                    <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
                                    <Text className="text-lg font-semibold text-gray-800 mt-4">
                                        {selectedUserId
                                            ? 'No posts from this user'
                                            : activeTab === 'My'
                                                ? 'You haven\'t posted yet'
                                                : activeTab === 'Following'
                                                    ? 'No posts from people you follow'
                                                    : 'No posts available'
                                        }
                                    </Text>
                                    <Text className="text-sm text-gray-500 mt-2 text-center">
                                        {activeTab === 'My'
                                            ? 'Share your thoughts with the community'
                                            : 'Be the first to share something!'}
                                    </Text>
                                </View>
                            ) : null
                        }
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
            )}

            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-8 right-6 w-14 h-14 bg-yellow-400 rounded-full items-center justify-center shadow-lg z-10"
            >
                <Ionicons name="add" size={32} color="black" />
            </TouchableOpacity>

            <CreatePostModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={createPost}
                isCreating={isCreating}
                userAvatar={profile?.data?.profile_picture_url!}
                userName={profile?.data?.full_name}
            />

        </SafeAreaView>
    );
}