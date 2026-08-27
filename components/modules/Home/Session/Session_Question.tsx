import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import { useSession } from "@/hooks/useSession";
import {
    AssessmentQuestion,
    ChoiceAssessmentQuestion,
    ScaleAssessmentQuestion,
    SubmitAssessmentResponse,
    TextAssessmentQuestion,
} from "@/services/session.api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SessionQuestionProps = {
    onComplete?: (response: SubmitAssessmentResponse) => void;
};

type AnswerMap = Record<string, string | number>;

const asChoiceQuestion = (question: AssessmentQuestion) =>
    question.type === "choice" ? (question as ChoiceAssessmentQuestion) : null;

const asScaleQuestion = (question: AssessmentQuestion) =>
    question.type === "scale" ? (question as ScaleAssessmentQuestion) : null;

const asTextQuestion = (question: AssessmentQuestion) =>
    question.type === "text" ? (question as TextAssessmentQuestion) : null;

const isAnswerValid = (
    question: AssessmentQuestion,
    value: string | number | undefined,
) => {
    if (value === undefined || value === null) {
        return false;
    }

    if (question.type === "text") {
        return String(value).trim().length > 0;
    }

    return true;
};

export default function SessionQuestion({ onComplete }: SessionQuestionProps) {
    const router = useRouter();
    const { assessmentQuestions, submitAssessment, submitAssessmentState } =
        useSession();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});

    const questions = assessmentQuestions.data ?? [];
    const totalQuestions = questions.length;
    const currentQuestion = questions[currentIndex];
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

    const isCurrentAnswerValid = useMemo(() => {
        if (!currentQuestion) {
            return false;
        }

        return isAnswerValid(currentQuestion, currentAnswer);
    }, [currentAnswer, currentQuestion]);

    const onSelectAnswer = (value: string | number) => {
        if (!currentQuestion) {
            return;
        }

        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: value,
        }));
    };

    const onNext = async () => {
        if (!currentQuestion || !isCurrentAnswerValid) {
            return;
        }

        const isLastQuestion = currentIndex === totalQuestions - 1;

        if (!isLastQuestion) {
            setCurrentIndex((prev) => prev + 1);
            return;
        }

        try {
            const response = await submitAssessment(answers);
            onComplete?.(response);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to submit assessment. Please try again.";

            Alert.alert("Submission failed", message);
        }
    };

    const onBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            return;
        }

        router.back();
    };

    if (assessmentQuestions.isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F7F8]">
                <ActivityIndicator size="large" color="#F6CF00" />
            </SafeAreaView>
        );
    }

    if (assessmentQuestions.isError || questions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#F7F7F8] px-5">
                <View className="flex-1 items-center justify-center">
                    <Text className="text-center text-lg font-semibold text-[#262626]">
                        Unable to load questions
                    </Text>
                    <Text className="mt-2 text-center text-sm text-[#6E6E73]">
                        Please try again to continue your session.
                    </Text>
                    <TouchableOpacity
                        className="mt-6 rounded-full bg-[#F6CF00] px-8 py-3"
                        onPress={() => assessmentQuestions.refetch()}
                    >
                        <Text className="font-semibold text-[#242424]">Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    const choiceQuestion = asChoiceQuestion(currentQuestion);
    const scaleQuestion = asScaleQuestion(currentQuestion);
    const textQuestion = asTextQuestion(currentQuestion);

    return (
        <SafeAreaView className="flex-1 bg-[#F7F7F8]">
            <View className="flex-1 px-5 pt-3">
                <View className="mb-8 flex-row items-center gap-4">
                    <TouchableOpacity
                        onPress={onBack}
                        className="h-11 w-11 items-center justify-center rounded-full bg-[#E7E7EA]"
                    >
                        <Ionicons name="chevron-back" size={22} color="#1F1F1F" />
                    </TouchableOpacity>

                    <Text className="text-lg font-bold text-[#111111]">
                        Question {currentIndex + 1}/{totalQuestions}
                    </Text>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-xl leading-8 font-semibold text-[#1A1A1A]">
                        {currentQuestion.question}
                    </Text>

                    <View className="mt-8 gap-4">
                        {choiceQuestion?.options?.map((option) => {
                            const isSelected = currentAnswer === option;

                            return (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => onSelectAnswer(option)}
                                    className={`rounded-2xl border px-5 py-4 ${isSelected
                                        ? "border-[#F4B400] bg-[#FFFBEA]"
                                        : "border-[#D9D9DE] bg-white"
                                        }`}
                                >
                                    <Text className="text-lg font-medium text-[#4A4A4A]">
                                        {option}.
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        {scaleQuestion ? (
                            <View className="rounded-2xl border border-[#D9D9DE] bg-white p-5">
                                <Text className="mb-4 text-base text-[#6E6E73]">
                                    Choose a value from {scaleQuestion.min} to {scaleQuestion.max}
                                </Text>

                                <View className="flex-row flex-wrap gap-3">
                                    {Array.from(
                                        { length: scaleQuestion.max - scaleQuestion.min + 1 },
                                        (_, index) => scaleQuestion.min + index,
                                    ).map((value) => {
                                        const isSelected = currentAnswer === value;

                                        return (
                                            <TouchableOpacity
                                                key={value}
                                                onPress={() => onSelectAnswer(value)}
                                                className={`h-12 w-12 items-center justify-center rounded-full border ${isSelected
                                                    ? "border-[#F4B400] bg-[#FFFBEA]"
                                                    : "border-[#D9D9DE]"
                                                    }`}
                                            >
                                                <Text className="text-base font-semibold text-[#313131]">
                                                    {value}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ) : null}

                        {textQuestion ? (
                            <View className="rounded-2xl border border-[#D9D9DE] bg-white p-4">
                                <TextInput
                                    multiline
                                    value={typeof currentAnswer === "string" ? currentAnswer : ""}
                                    placeholder={textQuestion.placeholder || "Type your answer here..."}
                                    placeholderTextColor="#97979B"
                                    onChangeText={(value) => onSelectAnswer(value)}
                                    textAlignVertical="top"
                                    className="min-h-[150px] text-base text-[#1F1F1F]"
                                />
                            </View>
                        ) : null}

                        {!choiceQuestion && !scaleQuestion && !textQuestion ? (
                            <View className="rounded-2xl border border-[#D9D9DE] bg-white p-5">
                                <Text className="text-base text-[#4A4A4A]">
                                    This question type is not supported yet.
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </ScrollView>

                <View className="pb-6 pt-4">
                    <CustomPrimaryButton
                        title={currentIndex === totalQuestions - 1 ? "Submit" : "Next"}
                        onPress={onNext}
                        loading={submitAssessmentState.isPending}
                        disabled={!isCurrentAnswerValid || submitAssessmentState.isPending}
                        className="rounded-2xl bg-[#F6CF00]"
                        textClassName="text-base text-[#2D2D2D]"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
