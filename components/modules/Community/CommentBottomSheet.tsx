import { api } from '@/lib/axios';
import { Ionicons } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetTextInput
} from '@gorhom/bottom-sheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, Text, TouchableOpacity, View } from 'react-native';

interface Comment {
    id: string;
    user: {
        full_name: string;
        profile_picture_url: string;
        email: string;
    };
    content: string;
    created_at: string;
}

interface Props {
    postId: number | null;
    sheetRef: React.RefObject<BottomSheetModal>;
}

export default function CommentBottomSheet({ postId, sheetRef }: Props) {
    const [commentText, setCommentText] = useState('');
    const queryClient = useQueryClient();

    // 1. Fetch Comments with unique key per postId
    const { data: comments = [], isLoading: isFetching } = useQuery({
        queryKey: ["comments", postId],
        queryFn: async () => {
            if (!postId) return [];
            const res = await api.get(`/api/community/posts/${postId}/comments/`);
            return res.data ?? [];
        },
        enabled: !!postId, // Only fetch when postId exists
    });

    // 2. Mutation for posting a comment
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            return await api.post(`/api/community/posts/${postId}/comments/`, { content });
        },
        onSuccess: () => {
            // Invalidate the specific post's comments to refresh the list instantly
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["community"] });
            // Clear input and hide keyboard
            setCommentText('');
            Keyboard.dismiss();
        },
        onError: (error) => {
            console.error("Comment failed:", error);
        }
    });

    const handleSendComment = () => {
        if (!commentText.trim() || commentMutation.isPending) return;
        commentMutation.mutate(commentText);
    };

    const snapPoints = useMemo(() => ['90%'], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.5}
            />
        ),
        []
    );

    const formatRelativeDate = (createdAt: string) => {
        const date = new Date(createdAt);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View className="flex-row gap-3 mb-5 px-4">
            <Image
                source={{ uri: item?.user?.profile_picture_url || "https://placehold.co/100" }}
                className="w-9 h-9 rounded-full bg-gray-100"
            />
            <View className="flex-1">
                <View className="bg-gray-100 p-3 rounded-2xl">
                    <Text className="font-bold text-gray-900 text-sm mb-1">
                        {item.user.full_name || "Anonymous"}
                    </Text>
                    <Text className="text-gray-700 text-sm">{item.content}</Text>
                </View>
                <Text className="text-gray-400 text-xs mt-1 ml-2">{formatRelativeDate(item.created_at)}</Text>
            </View>
        </View>
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
        >
            <View className="flex-1">
                {/* Header */}
                <View className="items-center py-3 border-b border-gray-100">
                    <Text className="font-bold text-gray-800 text-lg">Comments</Text>
                </View>

                {/* List Logic */}
                {isFetching && comments.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator color="#EAB308" />
                    </View>
                ) : (
                    <BottomSheetFlatList
                        data={comments}
                        keyExtractor={(item:any) => item.id.toString()}
                        renderItem={renderComment}
                        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center mt-20">
                                <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
                                <Text className="text-gray-400 mt-2">No comments yet.</Text>
                            </View>
                        }
                    />
                )}

                {/* Input Footer */}
                <View className="border-t border-gray-100 p-4 bg-white pb-10">
                    <View className="flex-row items-center gap-3 bg-gray-100 rounded-full px-4 py-2">
                        <BottomSheetTextInput
                            placeholder="Write a comment..."
                            className="flex-1 text-base py-1"
                            style={{ color: 'black' }}
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSendComment}
                            disabled={commentMutation.isPending || !commentText.trim()}
                        >
                            {commentMutation.isPending ? (
                                <ActivityIndicator size="small" color="#EAB308" />
                            ) : (
                                <Ionicons
                                    name="send"
                                    size={22}
                                    color={commentText.trim() ? "#EAB308" : "#D1D5DB"}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </BottomSheetModal>
    );
}