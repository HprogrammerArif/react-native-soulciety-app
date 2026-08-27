import React from "react";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { TouchableOpacity, Text, View } from "react-native";

export function MoodItem({
  index,
  scrollX,
  item,
  selectedIndex,
  setSelectedIndex,
}:any) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [
        (index - 1) * 90,
        index * 90,
        (index + 1) * 90,
      ],
      [0.7, 1.3, 0.7],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollX.value,
      [
        (index - 1) * 90,
        index * 90,
        (index + 1) * 90,
      ],
      [10, -5, 10], // subtle lift to avoid too much movement
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View style={[animatedStyle]} className="items-center mx-4">
      <TouchableOpacity
        onPress={() => setSelectedIndex(index)}
        className={`p-4 rounded-3xl ${
          selectedIndex === index ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        <item.icon width={65} height={65} />
      </TouchableOpacity>

      {selectedIndex === index && (
        <Text className="text-center mt-2 font-semibold text-gray-700">
          {item.name}
        </Text>
      )}
    </Animated.View>
  );
}
