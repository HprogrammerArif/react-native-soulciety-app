import { useUser } from '@/hooks/useUser';
import { api } from '@/lib/axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Linking,
    RefreshControl,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Simple Skeleton Component ---
const SkeletonItem = ({ width, height, style }: { width: number, height: number, style?: any }) => (
    <View style={[{ width, height, backgroundColor: '#f3f4f6', borderRadius: 16 }, style]} />
);

// Helper function for dynamic greeting
const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

export default function HomeScreen() {
    const { profile } = useUser();
    const [dailyQuote, setDailyQuote] = useState<any>(null);

    // Existing Quote Logic
    const loadQuote = useCallback(async () => {
        const storedQuote = await AsyncStorage.getItem('dailyQuote');
        const quoteDate = await AsyncStorage.getItem('quoteDate');
        const today = new Date().toISOString().split('T')[0];
        if (storedQuote && quoteDate === today) {
            setDailyQuote(JSON.parse(storedQuote));
        } else {
            try {
                const res = await api.get("/api/quote/");
                await AsyncStorage.setItem('dailyQuote', JSON.stringify(res.data));
                await AsyncStorage.setItem('quoteDate', today);
                setDailyQuote(res.data);
            } catch (error) { if (__DEV__) console.error(error); }
        }
    }, []);

    useEffect(() => { loadQuote(); }, [loadQuote]);

    // Fetch unread notification count
    const { data: unreadCount } = useQuery({
        queryKey: ["unread-notification-count"],
        queryFn: async () => {
            try {
                const res = await api.get("/api/notifications/?unread=true");
                return res.data?.notifications?.length ?? 0;
            } catch {
                return 0;
            }
        },
        staleTime: 60 * 1000,
    });

    const handleShareQuote = async () => {
        if (!dailyQuote) return;

        try {
            await Share.share({
                message: `"${dailyQuote.text}"\n\n- ${dailyQuote.author}`,
            });
        } catch (error) {
            if (__DEV__) console.error('Error sharing quote:', error);
        }
    };

    // 1. Shop Data
    const { data: SHOP_DATA, isLoading: isShopLoading, refetch: refetchShop } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await api.get("/api/shop/featured/")
            return res.data ?? []
        }
    });

    // console.log("SHopdata", SHOP_DATA)

    // 2. Popular Data
    const { data: POPULAR_DATA, isLoading: isPopularLoading, refetch: refetchPopular, isFetching } = useQuery({
        queryKey: ["popular"],
        queryFn: async () => {
            const res = await api.get("/api/spiritual/videos/popular/?limit=5")
            return res.data ?? []
        }
    });

    const onRefresh = useCallback(() => {
        loadQuote();
        refetchShop();
        refetchPopular();
    }, [loadQuote, refetchPopular, refetchShop]);

    const handleOpenShopLink = (url: string) => {
        if (url) {
            Linking.openURL(url).catch((err) => { if (__DEV__) console.error("Couldn't load page", err); });
        }
    };

    if (profile.isLoading || profile.isPending) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator color="#EAB308" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor="#EAB308" />
                }
            >
                {/* ---------------- HEADER (Original) ---------------- */}
                <View className="flex-row justify-between items-center mt-4 mb-6 border-b pb-4 border-gray-200">
                    <View className="flex-row items-center gap-3">
                        {profile?.data?.profile_picture_url ? (
                            <Image
                                source={{ uri: profile.data.profile_picture_url }}
                                className="size-16 rounded-full"
                            />
                        ) : (
                            <View className="size-16 rounded-full bg-yellow-100 items-center justify-center border border-yellow-200">
                                <Ionicons name="person" size={28} color="#CA8A04" />
                            </View>
                        )}
                        <View>
                            <Text className="text-gray-500 text-md font-semibold">{getGreeting()}</Text>
                            <Text className="text-yellow-500 text-xl font-bold">{profile?.data?.full_name}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/home/notification')}
                        className="bg-gray-100 p-2 rounded-full relative"
                        accessibilityLabel={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                    >
                        <Ionicons name="notifications-outline" size={24} color="black" />
                        {unreadCount > 0 && (
                            <View className='absolute top-2.5 right-3 size-2 rounded-full bg-red-500' />
                        )}
                    </TouchableOpacity>
                </View>

                {/* ---------------- DAILY QUOTE (Original) ---------------- */}
                <View className="mb-6">
                    <Text className="text-xl font-bold mb-3 text-gray-800">Daily quote</Text>
                    <View className="bg-gray-100 p-5 rounded-2xl">
                        <Text className="text-gray-600 text-base leading-6 italic font-medium">
                            &quot;{dailyQuote?.text}&quot;
                        </Text>
                        <View className="flex-row justify-between items-center mt-4">
                            <Text className="text-gray-400 text-sm font-medium">{dailyQuote?.author}</Text>
                            <TouchableOpacity onPress={handleShareQuote}>
                                <Ionicons name="share-social-outline" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="mb-8 rounded-[28px] bg-yellow-100 px-5 py-5 overflow-hidden">
                    <View className="absolute -right-6 -top-6 size-28 rounded-full bg-white/30" />
                    <View className="absolute -left-10 bottom-0 size-32 rounded-full bg-white/20" />

                    <View className="flex-row items-center gap-4">
                        <View className="size-28 items-center justify-center rounded-full border-[10px] border-gray-300 bg-white">
                            <Text className="text-lg font-extrabold text-gray-800">30 Day</Text>
                            <Text className="text-sm font-medium text-gray-500">Challenge</Text>
                        </View>

                        <View className="flex-1">
                            <Text className="text-md leading-9 font-bold text-gray-900">
                                Begin Your 30-Day Healing Journey
                            </Text>

                            <TouchableOpacity
                                onPress={() => router.push('/home/session')}
                                className="mt-4 rounded-full bg-yellow-400 px-3 py-3 items-center"
                            >
                                <Text className="text-md font-bold text-gray-900">Start session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ---------------- QUICK ACTIONS (Original) ---------------- */}
                <View className="mb-8">
                    <Text className="text-xl font-bold mb-3 text-gray-800">Quick Actions</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => router.push("/home/spiritual")}
                            className="flex-1 h-20 rounded-[20px] overflow-hidden"
                            accessibilityRole="button"
                            accessibilityLabel="Spiritual practices"
                        >
                            <ImageBackground
                                source={require("@/assets/images/spiritual-bg.jpg")}
                                className="w-full h-full justify-center items-center"
                            >
                                <View className="absolute inset-0 bg-black/40" />
                                <Text className="text-white font-bold text-lg z-10">Spiritual</Text>
                            </ImageBackground>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/home/journal")}
                            className="flex-1 h-20 rounded-[20px] overflow-hidden"
                            accessibilityRole="button"
                            accessibilityLabel="Journal and reflections"
                        >
                            <ImageBackground
                                source={require("@/assets/images/journal-bg.jpg")}
                                className="w-full h-full justify-center items-center"
                            >
                                <View className="absolute inset-0 bg-black/40" />
                                <Text className="text-white font-bold text-lg z-10">Journal</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ---------------- POPULAR SECTION (Improved) ---------------- */}
                <View className="mb-8">
                    <Text className="text-xl font-bold mb-3 text-gray-800">Popular on Soulciety</Text>

                    {isPopularLoading ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {[1, 2].map(k => <SkeletonItem key={k} width={280} height={160} style={{ marginRight: 16 }} />)}
                        </ScrollView>
                    ) : POPULAR_DATA?.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                                {POPULAR_DATA.map((item: any) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className="mr-4 w-72"
                                        onPress={() => router.push({ pathname: "/home/single-video", params: { id: item.id } })}
                                >
                                    <View className="relative">
                                        <Image
                                                source={{ uri: item.thumbnail_url }}
                                            className="w-full h-40 rounded-2xl bg-gray-100"
                                        />
                                        <View className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md flex-row items-center gap-1">
                                            <Ionicons name="play-circle" size={12} color="white" />
                                                <Text className="text-white text-[10px] font-bold">{item.views_count}</Text>
                                        </View>
                                    </View>
                                        <Text className="text-black font-bold text-base mt-2" numberOfLines={1}>{item.title}</Text>
                                        <Text className="text-gray-500 text-sm" numberOfLines={1}>{item.description}</Text>
                                </TouchableOpacity>
                            ))}
                            </ScrollView>
                    ) : (
                        <Text className="text-gray-400 italic py-4 text-center">No popular content available</Text>
                    )}
                </View>

                {/* ---------------- SHOP SECTION (Improved) ---------------- */}
                <View className="mb-4">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Text className="text-xl font-bold text-gray-800">Visit our shop</Text>
                        <Ionicons name="arrow-forward" size={20} color="black" />
                    </View>

                    {isShopLoading ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {[1, 2, 3].map(k => <SkeletonItem key={k} width={144} height={180} style={{ marginRight: 16 }} />)}
                        </ScrollView>
                    ) : SHOP_DATA?.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {SHOP_DATA.map((item: any) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className="mr-4 w-36"
                                    onPress={() => handleOpenShopLink(item.buy_url)}
                                >
                                    <View className="bg-gray-50 rounded-2xl p-2 border border-gray-100">
                                        <Image
                                            source={{ uri: item.image_url }}
                                            className="w-full h-32 rounded-xl bg-white"
                                            resizeMode="contain"
                                        />
                                        <Text className="text-gray-800 font-bold text-xs mt-2" numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                        <Text className="text-yellow-600 font-extrabold text-xs">
                                            ${item.price}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            </ScrollView>
                    ) : (
                        <Text className="text-gray-400 italic py-4 text-center">No featured products found</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}