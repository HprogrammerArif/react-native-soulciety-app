import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import { useUser } from "@/hooks/useUser";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileSettingScreen() {
  const { profile, updateProfile, updateProfileState } = useUser();

  /* ---------------- LOCAL STATE ---------------- */
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Image can be a string (URL) or an object (newly picked file)
  const [image, setImage] = useState<any>(null);

  /* ---------------- SYNC PROFILE → STATE ---------------- */
  useEffect(() => {
    if (profile?.data) {
      setFullName(profile.data.full_name ?? "");
      setEmail(profile.data.email ?? "");
      setPhone(profile.data.phone_number ?? "");
      setImage(profile.data.profile_picture_url);
    }
  }, [profile?.data]);

  /* ---------------- PICK IMAGE ---------------- */
  const pickImage = async (fromCamera = false) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission denied", "Please allow access to your photos");
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

      if (!result.canceled) {
        const asset = result.assets[0];
        const imageUri = Platform.OS === "android" && !asset.uri.startsWith("file://")
          ? `file://${asset.uri}`
          : asset.uri;
        setImage({
          uri: imageUri,
          // Ensure there is a filename and valid mime type
          name: asset.fileName || `profile_${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
        // If we pick an image, we should probably be in editing mode
        setIsEditing(true);
      }
    } catch (err) {
      if (__DEV__) console.log("Image Error", err);
    }
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("phone_number", phone);

      // Only append image if it's a new object (has a uri and is not just a string URL)
      if (image && typeof image === "object" && image.uri) {
        formData.append("profile_picture", {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      }

      const response = await updateProfile(formData);
      if (__DEV__) console.log("Upload Success:", response);
      setIsEditing(false);
      Toast.show({ type: "success", text1: "Profile updated successfully" });
    } catch (error: any) {
      if (__DEV__) console.error("Profile update error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  /* ---------------- LOADING ---------------- */
  if (profile.isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#EAB308" />
      </SafeAreaView>
    );
  }

  // Determine the display URI for the image
  const displayImageUri = typeof image === "string" ? image : image?.uri;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center items-center"
        >
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold">
          Profile setting
        </Text>

        <View className="w-10" />
      </View>

      {/* Body */}
      <View className="px-6 mt-6">
        {/* Profile Image */}
        <View className="flex-row items-center gap-4 mb-8">
          <Image
            source={{
              uri: displayImageUri || "https://placehold.co/600x400",
            }}
            className="w-20 h-20 rounded-full bg-gray-200"
          />

          <TouchableOpacity
            onPress={() => pickImage(false)}
            className="px-4 py-2 rounded-xl border border-yellow-400 bg-yellow-50 flex-row items-center gap-2"
          >
            <Feather name="camera" size={18} color="#EAB308" />
            <Text className="text-yellow-600 font-medium">
              Change picture
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View className="bg-gray-50 rounded-3xl p-5 border border-gray-200 relative">
          {/* Edit / Save Icon */}
          <TouchableOpacity
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
            className="absolute right-4 top-4 z-10"
            disabled={updateProfileState.isPending}
          >
            {updateProfileState.isPending ? (
              <ActivityIndicator size="small" color="#EAB308" />
            ) : (
              <Feather
                name={isEditing ? "check" : "edit-3"}
                size={20}
                  color={isEditing ? "#10B981" : "#6B7280"}
              />
            )}
          </TouchableOpacity>

          {/* Name */}
          <Text className="text-gray-500 mb-1">Name</Text>
          {isEditing ? (
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              className="border border-gray-300 rounded-xl px-4 py-2 mb-4 bg-white"
              placeholder="Full Name"
            />
          ) : (
              <Text className="text-gray-800 font-medium mb-4">
                {profile.data?.full_name || "Not set"}
              </Text>
          )}

          {/* Email */}
          <Text className="text-gray-500 mb-1">Email</Text>

              <Text className="text-gray-800 font-medium mb-4">
                {profile.data?.email}
              </Text>


          {/* Phone */}
          <Text className="text-gray-500 mb-1">Phone Number</Text>
          {isEditing ? (
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="border border-gray-300 rounded-xl px-4 py-2 bg-white"
              placeholder="Phone Number"
            />
          ) : (
              <Text className="text-gray-800 font-medium">
                {profile.data?.phone_number || "—"}
              </Text>
          )}
        </View>

        <View className="mt-5">
          {isEditing ? (
            <CustomPrimaryButton
              onPress={handleSave}
              title={updateProfileState.isPending ? "Saving..." : "Save Profile"}
            />
          ) : (
            <CustomPrimaryButton
              title="Edit Profile"
              onPress={() => setIsEditing(true)}
            />
          )}
        </View>
        {/* Change Password */}
        <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)/reset-password", params: { email: profile.data?.email } })} className="mt-8">
          <Text className="text-black underline font-medium">
            Change password
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}