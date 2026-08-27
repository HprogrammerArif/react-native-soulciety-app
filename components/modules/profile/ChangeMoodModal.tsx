import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";

type ChangeMoodModalProps = {
  visible: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export default function ChangeMoodModal({
  visible,
  onConfirm,
  onCancel,
  loading = false,
}: ChangeMoodModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center self-center mb-4">
            <Ionicons name="happy-outline" size={32} color="#EAB308" />
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Do you want to change your mood?
          </Text>

          {/* Description */}
          <Text className="text-sm text-gray-500 text-center mb-6">
            Your current mood will be reset to the default mood (Angry). You can then choose a new mood that reflects how you're feeling today.
          </Text>

          {/* Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              className="bg-yellow-400 h-12 rounded-full items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text className="font-bold text-base text-white">
                  Yes, Change Mood
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              className="bg-gray-100 h-12 rounded-full items-center justify-center"
            >
              <Text className="font-semibold text-base text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
