import { useCommunity } from '@/hooks/useCommunity';
import { useUser } from '@/hooks/useUser';
import { api } from '@/lib/axios';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { formatDistanceToNow } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CommentBottomSheet from './CommentBottomSheet';

export default function PostCard({ item, users, onFollowPress, activeTab }: any) {
    const optionsSheetRef = useRef<BottomSheetModal>(null);
    const updateSheetRef = useRef<BottomSheetModal>(null);
    const commentSheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets()

    const { profile } = useUser();
    const { likePost, deletePost, updatePost } = useCommunity(activeTab);

    // State for editing
    const [editedContent, setEditedContent] = useState(item.content);
    const [selectedImage, setSelectedImage] = useState(item.image_url);
    const [isUpdating, setIsUpdating] = useState(false);

    // State for reporting
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    const isLiked = item?.likes?.some((l: any) => l.user?.id === profile?.data?.id);
    const isOwner = Number(item?.user?.id) === Number(profile?.data?.id);
    const isFollowing = users?.some((u: any) => Number(u.id) === Number(item.user?.id));

    const renderBackdrop = useCallback((props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ), []);

    const formatRelativeDate = (createdAt: string) => {
        const date = new Date(createdAt);
        return formatDistanceToNow(date, { addSuffix: true });
    };

    const handleEditPress = () => {
        optionsSheetRef.current?.dismiss();
        // Reset states to current item values before opening
        setEditedContent(item.content);
        setSelectedImage(item.image_url);
        setTimeout(() => updateSheetRef.current?.present(), 200);
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8, // Reduced quality to avoid large files
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                console.log('Selected image URI:', imageUri);
                setSelectedImage(imageUri);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleUpdate = async () => {
        if (!editedContent.trim()) {
            Alert.alert("Error", "Content cannot be empty");
            return;
        }

        setIsUpdating(true);
        try {
            const formData = new FormData();

            // 1. Append text content
            formData.append('content', editedContent);

            // 2. Append image only if it has changed
            if (selectedImage && selectedImage !== item.image_url) {
                try {
                    // Get file extension
                    const uriParts = selectedImage.split('.');
                    const fileType = uriParts[uriParts.length - 1].toLowerCase();

                    // Get filename from URI
                    const fileName = selectedImage.split('/').pop() || `photo_${Date.now()}.${fileType}`;

                    // Determine MIME type
                    let mimeType = `image/${fileType}`;
                    if (fileType === 'jpg') mimeType = 'image/jpeg';
                    if (fileType === 'png') mimeType = 'image/png';
                    if (fileType === 'gif') mimeType = 'image/gif';
                    if (fileType === 'webp') mimeType = 'image/webp';

                    // @ts-ignore - React Native FormData accepts this format
                    formData.append('image', {
                        uri: selectedImage,
                        name: fileName,
                        type: mimeType,
                    });

                    console.log('Image appended:', { fileName, mimeType, uri: selectedImage });
                } catch (imgError) {
                    console.error('Image processing error:', imgError);
                    throw new Error('Failed to process image');
                }
            }

            console.log('Updating post with ID:', item.id);

            // ✅ Pass as a single object with postId and formData
            await updatePost({ postId: item.id, formData });

            updateSheetRef.current?.dismiss();
            Alert.alert("Success", "Post updated successfully");
        } catch (error: any) {
            console.error("Update error:", error);
            console.error("Error response:", error?.response?.data);
            console.error("Error message:", error?.message);

            // Show more specific error message
            const errorMessage = error?.response?.data?.message
                || error?.message
                || "Failed to update post";

            Alert.alert("Error", errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deletePost(item.id);
        } catch (error: any) {
            // Ignore abort/cancel errors
            if (
                error?.message === 'Network Error' ||
                error?.code === 'ERR_CANCELED'
            ) {
                console.log('Delete request aborted safely');
                return;
            }

            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete post');
        }
    };

    const handleDelete = () => {
        optionsSheetRef.current?.dismiss();
        Alert.alert("Delete Post", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: handleDeleteConfirm }
        ]);
    };

    // API Functions for reporting
    const reportPost = async () => {
        if (!reportReason.trim()) {
            Alert.alert('Error', 'Please enter a reason for reporting');
            return;
        }

        try {
            setIsReporting(true);
            await api.post(`/api/community/posts/report/`, {
                post_id: item?.id,
                reason: reportReason,
            });

            Toast.show({
                type: 'success',
                text1: 'Report Submitted',
                text2: 'Thank you for reporting this post',
            });

            setReportReason('');
            setReportModalVisible(false);
        } catch (error: any) {
            console.error('Report error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to submit report',
            });
        } finally {
            setIsReporting(false);
        }
    };

    console.log(item?.user?.profile_picture_url, "profile")
    return (
        <View className="bg-white p-5 mb-3 border-t border-gray-100">
            {/* Header */}
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row gap-3">
                    <Image source={{ uri: item?.user?.profile_picture_url || 'https://via.placeholder.com/150' }} className="w-10 h-10 rounded-full bg-gray-100" />
                    <View>
                        <Text className="font-bold text-gray-900">{item.user?.full_name}</Text>
                        <Text className="text-xs text-gray-500">{formatRelativeDate(item.created_at)}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => optionsSheetRef.current?.present()} className="p-2">
                    <Entypo name="dots-three-vertical" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <Text className="text-gray-800 text-[15px] leading-6 mb-3">{item.content}</Text>
            {item.image_url && <Image source={{ uri: item.image_url }} className="w-full h-56 rounded-3xl mb-4" />}

            {/* Actions */}
            <View className="flex-row items-center gap-6 pt-3 border-t border-gray-50">
                <TouchableOpacity onPress={() => likePost(item.id)} className="flex-row items-center gap-1.5">
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? "#EF4444" : "#6B7280"} />
                    <Text className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>{item.likes_count || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => commentSheetRef.current?.present()} className="flex-row items-center gap-1.5">
                    <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                    <Text className="text-gray-500 text-sm font-medium">{item.comments_count || 0}</Text>
                </TouchableOpacity>
            </View>

            {/* Options Menu */}
            <BottomSheetModal ref={optionsSheetRef} index={0} snapPoints={isOwner ? ['25%'] : ['28%']} backdropComponent={renderBackdrop}>
                <BottomSheetView className="p-6" style={{ paddingBottom: insets.bottom + 20, }}>
                    {isOwner ? (
                        <>
                            <TouchableOpacity onPress={handleEditPress} className="flex-row items-center py-3">
                                <Ionicons name="pencil-outline" size={22} color="black" />
                                <Text className="ml-4 text-lg font-medium">Edit Post</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} className="flex-row items-center py-3">
                                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                <Text className="ml-4 text-lg font-medium text-red-500">Delete Post</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                onPress={() => {
                                    optionsSheetRef.current?.dismiss();
                                    onFollowPress(item.user);
                                }}
                                className="flex-row items-center py-3"
                            >
                                <Ionicons name={isFollowing ? "person-remove-outline" : "person-add-outline"} size={22} color="black" />
                                <Text className="ml-4 text-lg font-medium">
                                    {isFollowing ? "Unfollow" : "Follow"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    optionsSheetRef.current?.dismiss();
                                    setReportModalVisible(true);
                                }}
                                className="flex-row items-center py-3"
                            >
                                <Ionicons name="flag-outline" size={22} color="#EF4444" />
                                <Text className="ml-4 text-lg font-medium text-red-500">Report Post</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </BottomSheetView>
            </BottomSheetModal>

            {/* Update Post Modal */}
            <BottomSheetModal
                ref={updateSheetRef}
                index={0}
                snapPoints={['60%']}
                backdropComponent={renderBackdrop}
                keyboardBehavior="fillParent"
            >
                <BottomSheetView className="p-6 flex-1" style={{ paddingBottom: insets.bottom + 20, }}>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold">Edit Post</Text>
                        <TouchableOpacity
                            onPress={handleUpdate}
                            disabled={isUpdating}
                            className="bg-yellow-500 px-4 py-2 rounded-full"
                        >
                            {isUpdating ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Update</Text>}
                        </TouchableOpacity>
                    </View>

                    <BottomSheetTextInput
                        value={editedContent}
                        onChangeText={setEditedContent}
                        multiline
                        placeholder="What's on your mind?"
                        className="bg-gray-100 p-4 rounded-2xl min-h-[100px] text-base mb-4"
                        textAlignVertical="top"
                    />

                    <TouchableOpacity onPress={pickImage} className="relative">
                        <Image
                            source={{ uri: selectedImage || 'https://via.placeholder.com/150' }}
                            className="w-full h-40 rounded-2xl bg-gray-200"
                        />
                        <View className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                            <Ionicons name="camera" size={30} color="white" />
                            <Text className="text-white font-medium mt-1">Change Photo</Text>
                        </View>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>

            <CommentBottomSheet sheetRef={commentSheetRef} postId={item.id} />

            {/* Report Modal */}
            <Modal
                visible={reportModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setReportModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-5">
                    <View className="bg-white rounded-3xl p-6 w-full">
                        <Text className="text-xl font-bold text-gray-900 mb-2">Report Post</Text>
                        <Text className="text-gray-600 text-sm mb-4">Please tell us why you&apos;re reporting this post</Text>

                        <TextInput
                            value={reportReason}
                            onChangeText={setReportReason}
                            placeholder="Enter reason..."
                            placeholderTextColor="#D1D5DB"
                            multiline
                            numberOfLines={4}
                            className="border border-gray-200 rounded-2xl p-4 text-base text-gray-800 mb-4"
                            textAlignVertical="top"
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setReportReason('');
                                    setReportModalVisible(false);
                                }}
                                className="flex-1 border border-gray-300 rounded-full py-3 justify-center items-center"
                            >
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={reportPost}
                                disabled={isReporting || !reportReason.trim()}
                                className={`flex-1 rounded-full py-3 justify-center items-center ${isReporting || !reportReason.trim()
                                    ? 'bg-gray-300'
                                    : 'bg-red-500'
                                    }`}
                            >
                                {isReporting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Report</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}