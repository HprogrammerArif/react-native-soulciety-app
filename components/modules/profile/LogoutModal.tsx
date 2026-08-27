import { useUser } from "@/hooks/useUser";
import React from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean
};

export default function LogoutModal({ visible, onConfirm, onCancel, loading }: Props) {

  return (
    <Modal transparent animationType="fade" visible={visible}>
      {/* Overlay */}
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        {/* Modal Box */}
        <View className="w-full bg-white rounded-2xl p-6">
          {/* Title */}
          <Text className="text-xl font-bold text-center text-gray-900">
            Log out
          </Text>

          {/* Subtitle */}
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Are you sure you want to log out
          </Text>

          <View className="border-b border-gray-200 mb-6" />

          {/* Buttons */}
          <View className="flex-row justify-between gap-3">
            {/* Log out */}
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-yellow-400 py-3 rounded-xl items-center justify-center"
            >
              {
                loading ? <ActivityIndicator /> : <Text className="text-black font-semibold text-base">
                  Log out
                </Text>
              }
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
