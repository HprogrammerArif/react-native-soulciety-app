import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import {
    AssessmentProfileResponse,
    getAssessmentProfile,
    getAssessmentStatus,
} from "@/services/session.api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SessionSummaryProps = {
    profile: AssessmentProfileResponse | null;
    onContinue: () => void;
    onBack: () => void;
};

type SummaryItemProps = {
    label: string;
    value?: string;
};

const SummaryItem = ({ label, value }: SummaryItemProps) => (
    <View className="rounded-2xl border border-[#E3E3E7] bg-white p-4">
        <Text className="text-xs font-semibold uppercase tracking-wide text-[#8E8E93]">
            {label}
        </Text>
        <Text className="mt-2 text-base leading-6 text-[#1F1F1F]">
            {value || "Not available yet"}
        </Text>
    </View>
);

export default function SessionSummary({
    profile: initialProfile,
    onContinue,
    onBack,
}: SessionSummaryProps) {
    const statusQuery = useQuery({
        queryKey: ["assessment-status-summary"],
        queryFn: getAssessmentStatus,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "ready" || status === "failed") {
                return false;
            }
            return 3000;
        },
    });

    const profileQuery = useQuery({
        queryKey: ["assessment-profile"],
        queryFn: getAssessmentProfile,
        enabled: statusQuery.data?.status === "ready",
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const resolvedProfile: AssessmentProfileResponse | null =
        profileQuery.data || initialProfile || null;
    const healingProfile = resolvedProfile?.healing_profile;

    const isGenerating =
        statusQuery.data?.status === "pending" ||
        statusQuery.data?.status === "generating" ||
        (!statusQuery.data && !resolvedProfile);
    const hasFailed = statusQuery.data?.status === "failed";

    return (
        <SafeAreaView className="flex-1 bg-[#F7F7F8]">
            <View className="flex-1 px-5 pt-3">
                <View className="mb-6 flex-row items-center gap-4">
                    <TouchableOpacity
                        onPress={onBack}
                        className="h-11 w-11 items-center justify-center rounded-full bg-[#E7E7EA]"
                    >
                        <Ionicons name="chevron-back" size={22} color="#1F1F1F" />
                    </TouchableOpacity>

                    <Text className="text-xl font-bold text-[#121212]">Healing Summary</Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {isGenerating ? (
                        <View className="mb-4 flex-row items-center rounded-2xl border border-[#E3E3E7] bg-white p-4">
                            <ActivityIndicator size="small" color="#F6CF00" />
                            <Text className="ml-3 text-sm text-[#5F5F63]">
                                Preparing your personalized healing summary...
                            </Text>
                        </View>
                    ) : null}

                    {hasFailed ? (
                        <View className="mb-4 rounded-2xl border border-[#F0D1D1] bg-[#FFF3F3] p-4">
                            <Text className="text-sm text-[#8B2E2E]">
                                We could not generate your healing summary right now. You can continue and start your journey.
                            </Text>
                        </View>
                    ) : null}

                    <View className="rounded-2xl border border-[#E3E3E7] bg-[#FFFBEA] p-4">
                        <Text className="text-sm font-semibold text-[#8A6A00]">Your Healing Arc</Text>
                        <Text className="mt-2 text-base leading-6 text-[#2A2A2A]">
                            {healingProfile?.healing_arc_summary ||
                                "Your personalized summary is being prepared."}
                        </Text>
                    </View>

                    <View className="mt-4 gap-3">
                        <SummaryItem label="Core Wound" value={healingProfile?.core_wound} />
                    </View>
                </ScrollView>

                <View className="pb-6 pt-4">
                    <CustomPrimaryButton
                        title="Continue"
                        onPress={onContinue}
                        className="rounded-2xl bg-[#F6CF00]"
                        textClassName="text-base text-[#2D2D2D]"
                        loading={profileQuery.isFetching}
                        disabled={isGenerating}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
