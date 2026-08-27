import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

/* ================= TYPES (UNCHANGED) ================= */

type CreatePostModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isCreating: boolean;
  userAvatar?: string;
  userName?: string;
};

/* ================= COMPONENT ================= */

export default function CreatePostModal({
  visible,
  onClose,
  onSubmit,
  isCreating,
  userAvatar,
  userName,
}: CreatePostModalProps) {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  /* ================= SNAP POINTS ================= */

  const snapPoints = useMemo(() => ["85%"], []);

  /* ================= SYNC WITH `visible` ================= */

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
      // Reset state when modal closes
      setText("");
      setSelectedImage(null);
    }
  }, [visible]);

  /* ================= BACKDROP ================= */

  const renderBackdrop = useCallback((props: any) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  ), []);

  /* ================= IMAGE PICKERS ================= */

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            "Camera Permission Required",
            "Please enable camera access from iPhone Settings to take photos.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }

        Alert.alert("Permission Denied", "Camera access is required.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera launch failed", error);
      Alert.alert("Camera Error", "Unable to open camera right now. Please try again.");
    }
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || isCreating) return;

    const formData = new FormData();
    formData.append("content", text);

    if (selectedImage) {
      const filename = selectedImage.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image";

      formData.append("image", {
        uri: selectedImage,
        name: filename,
        type,
      } as any);
    }

    try {
      await onSubmit(formData);
      setText("");
      setSelectedImage(null);
      onClose();
    } catch (e) {
      console.error("Create post failed", e);
    }
  }, [text, selectedImage, isCreating, onSubmit, onClose]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleFocus = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={{ backgroundColor: "#E5E7EB" }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* HEADER */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center gap-3">
            <Image
              source={{ uri: userAvatar }}
              className="w-10 h-10 rounded-full bg-gray-200"
            />
            <Text className="text-lg font-bold text-gray-800">
              {userName}
            </Text>
          </View>

          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* INPUT */}
        <View className="bg-gray-50 rounded-3xl p-4 min-h-[150px] mb-6 border border-gray-100">
          <TextInput
            placeholder="What's on your mind?"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            style={{
              fontSize: 16,
              color: '#1F2937',
              minHeight: 80,
              padding: 0,
            }}
            value={text}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
          />

          {/* IMAGE PREVIEW */}
          {selectedImage && (
            <View className="mt-3 relative w-24 h-24">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full rounded-xl"
              />
              <TouchableOpacity
                onPress={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* ATTACHMENTS */}
          <View className="flex-row justify-end gap-5 mt-4">
            <TouchableOpacity onPress={takePhoto}>
              <Feather name="camera" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <Feather name="image" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* POST BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || isCreating}
          activeOpacity={0.8}
          className={`py-4 rounded-full items-center ${text.trim() && !isCreating ? "bg-yellow-400" : "bg-gray-200"
            }`}
        >
          {isCreating ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text className="text-black font-bold text-lg">
              Post to Community
            </Text>
          )}
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
