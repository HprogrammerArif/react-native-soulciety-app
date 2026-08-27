import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type SessionHeaderProps = {
  title: string;
  onBackPress: () => void;
  textColor?: string;
};

export default function SessionHeader({ title, onBackPress, textColor }: SessionHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center gap-4">
      <TouchableOpacity
        onPress={onBackPress}
        className="h-11 w-11 items-center justify-center rounded-full bg-[#D9D9DC]"
      >
        <Ionicons name="chevron-back" size={22} color="#232323" />
      </TouchableOpacity>

      <Text className={`text-[20px] font-bold flex-1 ${textColor || "text-[#1D1D1F]"}`}>{title}</Text>
    </View>
  );
}