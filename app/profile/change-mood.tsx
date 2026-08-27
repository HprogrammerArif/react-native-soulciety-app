import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// --- ICONS ---
import AngryIcon from "../../assets/images/angry.svg";
import AnxiousIcon from "../../assets/images/anxious.svg";
import ConfidentIcon from "../../assets/images/confident.svg";
import ExcitedIcon from "../../assets/images/excited.svg";
import FearIcon from "../../assets/images/fear.svg";
import HappyIcon from "../../assets/images/happy.svg";
import RelaxedIcon from "../../assets/images/relaxed.svg";
import SadIcon from "../../assets/images/sad.svg";
import SatisfiedIcon from "../../assets/images/satisfied.svg";
import SickIcon from "../../assets/images/sick.svg";

// --- HOOK ---
import { useMood } from "@/hooks/useMood";

// --- CONFIG ---
const { width } = Dimensions.get("window");
const VISIBLE_ITEMS = 5;
const ITEM_SIZE = width / VISIBLE_ITEMS;
const SPACER = (width - ITEM_SIZE) / 2;

const MOODS = [
  { key: "happy", label: "Happy", color: "#FCD34D", Icon: HappyIcon },
  { key: "sad", label: "Sad", color: "#9CA3AF", Icon: SadIcon },
  { key: "satisfied", label: "Satisfied", color: "#F2CB4A", Icon: SatisfiedIcon },
  { key: "angry", label: "Angry", color: "#F97316", Icon: AngryIcon },
  { key: "relaxed", label: "Relaxed", color: "#74D4FF", Icon: RelaxedIcon },
  { key: "sick", label: "Sick", color: "#84CC16", Icon: SickIcon },
  { key: "confident", label: "Confident", color: "#C4B4FF", Icon: ConfidentIcon },
  { key: "fear", label: "Fear", color: "#FBBF24", Icon: FearIcon },
  { key: "excited", label: "Excited", color: "#FF637E", Icon: ExcitedIcon },
  { key: "anxious", label: "Anxious", color: "#FF6900", Icon: AnxiousIcon },
];

const DEFAULT_INDEX = 3;

export default function MoodTrackerScreen() {
  const insets = useSafeAreaInsets();
  const { moodKey, saveMood, loading, saving } = useMood();

  const [currentMoodIndex, setCurrentMoodIndex] =
    useState<number>(DEFAULT_INDEX);

  // --- ANIMATION ---
  const scrollX = useSharedValue(DEFAULT_INDEX * ITEM_SIZE);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_SIZE);
    const safeIndex = Math.max(0, Math.min(index, MOODS.length - 1));
    setCurrentMoodIndex(safeIndex);
  };

  // --- RESTORE MOOD FROM HOOK ---
  useEffect(() => {
    if (!moodKey) return;

    const index = MOODS.findIndex((m) => m.key === moodKey);
    if (index !== -1) {
      setCurrentMoodIndex(index);
      scrollX.value = index * ITEM_SIZE;
    }
  }, [moodKey]);

  // --- SAVE MOOD ---
  const handleSaveMood = async () => {
    const selectedMoodKey = MOODS[currentMoodIndex].key;
    await saveMood(selectedMoodKey);
    router.push("/(tabs)");
  };

  // --- ITEM RENDER ---
  const RenderItem = ({
    item,
    index,
  }: {
    item: typeof MOODS[0];
    index: number;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 2) * ITEM_SIZE,
        (index - 1) * ITEM_SIZE,
        index * ITEM_SIZE,
        (index + 1) * ITEM_SIZE,
        (index + 2) * ITEM_SIZE,
      ];

      const scale = interpolate(
        scrollX.value,
        inputRange,
        [1.0, 1.5, 2.3, 1.5, 1.0],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 0.8, 1, 0.8, 0.5],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <View style={{ width: ITEM_SIZE }} className="h-48 justify-center items-center">
        <Animated.View style={animatedStyle}>
          <View className="w-10 h-10">
            <item.Icon width="100%" height="100%" />
          </View>
        </Animated.View>
      </View>
    );
  };

  if (loading) return null;

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View className="mt-28 items-center px-6">
        <Text className="text-6xl font-medium text-black text-center">
          Change your
        </Text>
        <Text className="text-5xl font-bold text-yellow-400 text-center">
          Feeling <Text className="text-black font-medium">Today</Text>
        </Text>
      </View>

      {/* MOOD PICKER */}
      <View className="flex-1 justify-center items-center relative">
        <View
          className="absolute bg-gray-50 rounded-3xl z-0 justify-end items-center pb-4"
          style={{
            width: 90,
            height: 150,
            top: "50%",
            marginTop: -75,
          }}
        >
          <Text className="text-gray-600 font-bold text-lg">
            {MOODS[currentMoodIndex]?.label}
          </Text>
        </View>

        <View style={{ height: 200 }}>
          <Animated.FlatList
            data={MOODS}
            keyExtractor={(item) => item.key}
            renderItem={({ item, index }) => (
              <RenderItem item={item} index={index} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: SPACER }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={onMomentumScrollEnd}
            initialScrollIndex={DEFAULT_INDEX}
            getItemLayout={(data, index) => ({
              length: ITEM_SIZE,
              offset: ITEM_SIZE * index,
              index,
            })}
          />
        </View>
      </View>

      {/* SAVE BUTTON */}
      <View className="mb-16 items-center">
        <TouchableOpacity
          onPress={handleSaveMood}
          activeOpacity={0.8}
          className="bg-yellow-400 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        >
          {
            saving ? <ActivityIndicator className="text-white" /> : <Svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M5 12h14" />
              <Path d="M12 5l7 7-7 7" />
            </Svg>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}
