import React from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
};

export default function DeleteAccountModal({ visible, onConfirm, onCancel, loading }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      {/* Overlay */}
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        {/* Modal Box */}
        <View className="w-full bg-white rounded-2xl p-6">
          {/* Title */}
          <Text className="text-xl font-bold text-center text-red-500">
            Delete Account
          </Text>

          {/* Subtitle */}
          <Text className="text-gray-600 text-center mt-2 mb-2 leading-5">
            Are you sure you want to permanently delete your account?
          </Text>

          <Text className="text-gray-500 text-center text-sm mb-6 leading-5">
            This action cannot be undone. All your data including profile, journal entries, chat history, and community posts will be permanently removed.
          </Text>

          <View className="border-b border-gray-200 mb-6" />

          {/* Buttons */}
          <View className="flex-row justify-between gap-3">
            {/* Delete */}
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-red-500 py-3 rounded-xl items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Delete Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-100 py-3 rounded-xl items-center justify-center"
            >
              <Text className="text-gray-800 font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
