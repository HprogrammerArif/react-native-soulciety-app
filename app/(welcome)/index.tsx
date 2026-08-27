import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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
import { useFocusEffect } from "@react-navigation/native";

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
const VISIBLE_ITEMS = 5;

export default function MoodTrackerScreen() {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerWidthRef = useRef(0);

  const ITEM_SIZE = containerWidth / VISIBLE_ITEMS;
  const SPACER = containerWidth > 0 ? (containerWidth - ITEM_SIZE) / 2 : 0;

  const insets = useSafeAreaInsets();
  const { moodKey, saveMood, loading, saving } = useMood();
  console.log("saving", saving)

  const [currentMoodIndex, setCurrentMoodIndex] = useState<number>(DEFAULT_INDEX);

  const flatListRef = useRef<any>(null);

  // ✅ Track whether we need to restore scroll after FlatList layout
  const pendingScrollIndexRef = useRef<number | null>(null);
  const flatListReadyRef = useRef(false);

  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const onMomentumScrollEnd = (event: any) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / ITEM_SIZE);
    const safeIndex = Math.max(0, Math.min(index, MOODS.length - 1));
    const correctedOffset = safeIndex * ITEM_SIZE;

    flatListRef.current?.scrollToOffset({ offset: correctedOffset, animated: true });
    scrollX.value = correctedOffset;
    setCurrentMoodIndex(safeIndex);
  };

  // ✅ This function does the actual scroll — called once FlatList is ready
  const restoreScroll = useCallback((index: number) => {
    const width = containerWidthRef.current;
    if (width === 0 || !flatListRef.current) return;

    const itemSize = width / VISIBLE_ITEMS;
    const offset = index * itemSize;

    flatListRef.current.scrollToOffset({ offset, animated: false });
    scrollX.value = offset;
    setCurrentMoodIndex(index);
  }, []);

  // ✅ When screen comes into focus, store the index we want to restore.
  // Falls back to DEFAULT_INDEX (Angry) so the centered emoji matches the
  // default label on first load when no mood has been saved yet.
  useFocusEffect(
    useCallback(() => {
      const savedIndex = moodKey
        ? MOODS.findIndex((m) => m.key === moodKey)
        : -1;
      const index = savedIndex === -1 ? DEFAULT_INDEX : savedIndex;

      pendingScrollIndexRef.current = index;

      // If FlatList is already ready (returning to screen), restore immediately
      if (flatListReadyRef.current) {
        // Small timeout to let navigation animation settle
        const id = setTimeout(() => restoreScroll(index), 50);
        return () => clearTimeout(id);
      }
      // Otherwise onFlatListLayout will pick it up
    }, [moodKey, restoreScroll])
  );

  // ✅ Called when FlatList itself finishes layout — guaranteed the scroll view is ready
  const onFlatListLayout = useCallback(() => {
    flatListReadyRef.current = true;

    if (pendingScrollIndexRef.current !== null) {
      const index = pendingScrollIndexRef.current;
      pendingScrollIndexRef.current = null;

      // Use requestAnimationFrame to ensure the internal scroll view is mounted
      requestAnimationFrame(() => {
        restoreScroll(index);
      });
    }
  }, [restoreScroll]);

  const handleSaveMood = async () => {
    const selectedMoodKey = MOODS[currentMoodIndex].key;
    await saveMood(selectedMoodKey);
    router.push("/(tabs)");
  };

  const RenderItem = ({
    item,
    index,
  }: {
    item: (typeof MOODS)[0];
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

      return { transform: [{ scale }], opacity };
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
          How are you
        </Text>
        <Text className="text-5xl font-bold text-yellow-400 text-center">
          Feeling <Text className="text-black font-medium">Today</Text>
        </Text>
      </View>

      {/* MOOD PICKER */}
      <View className="flex-1 justify-center items-center relative">
        <View
          style={{ height: 200, width: "100%", position: "relative" }}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            containerWidthRef.current = width;
            setContainerWidth(width);
          }}
        >
          {/* CENTER HIGHLIGHT BOX */}
          <View
            style={{
              width: 90,
              height: 150,
              position: "absolute",
              top: "50%",
              left: "50%",
              marginLeft: -45,
              marginTop: -75,
              zIndex: 0,
            }}
            className="bg-gray-50 rounded-3xl justify-end items-center pb-4"
          >
            <Text className="text-gray-600 font-bold text-lg">
              {MOODS[currentMoodIndex]?.label}
            </Text>
          </View>

          {/* SCROLLABLE EMOJI LIST */}
          {containerWidth > 0 && (
            <Animated.FlatList
              ref={flatListRef}
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
              // ✅ Key fix: fire restoreScroll once FlatList is laid out
              onLayout={onFlatListLayout}
              getItemLayout={(_, index) => ({
                length: ITEM_SIZE,
                offset: ITEM_SIZE * index,
                index,
              })}
            />
          )}
        </View>
      </View>

      {/* SAVE BUTTON */}
      <View className="mb-16 items-center">
        <TouchableOpacity
          onPress={handleSaveMood}
          activeOpacity={0.8}
          className="bg-yellow-400 w-16 h-16 rounded-full items-center justify-center shadow-lg"
        >
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Svg
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
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}