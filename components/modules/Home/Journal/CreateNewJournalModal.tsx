import KeyboardAwareWrapper from '@/components/global/KeyboardAwareWrapper';
import { useJournal } from '@/hooks/useJournal';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    Keyboard,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

const MOOD_TAGS = [
    'Peaceful',
    'Grateful',
    'Anxious',
    'Joyful',
    'Reflective',
    'Energize',
    'Uncertain',
    'Hopeful',
];

const { height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.67;

export default function CreateNewJournalModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const [step, setStep] = useState<'INPUT' | 'GENERATING'>('INPUT');
    const [selectedTag, setSelectedTag] = useState('Peaceful');
    const [text, setText] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    /** Bottom Sheet Animation */
    const translateY = useSharedValue(SHEET_HEIGHT);
    const progressWidth = useSharedValue(0);
    const { createEntry } = useJournal();


    useEffect(() => {
        if (visible) {
            setStep('INPUT');
            setText('');
            setErrorMessage('');
            progressWidth.value = 0;

            translateY.value = withTiming(0, {
                duration: 350,
                easing: Easing.out(Easing.cubic),
            });
        } else {
            translateY.value = SHEET_HEIGHT;
        }
    }, [visible]);

    const closeSheet = useCallback(() => {
        translateY.value = withTiming(
            SHEET_HEIGHT,
            { duration: 300 },
            (finished) => {
                if (finished) {
                    runOnJS(onClose)();
                }
            }
        );
    }, [translateY, onClose]);

    const handleTextChange = useCallback((newText: string) => {
        setText(newText);
        if (errorMessage) setErrorMessage('');
    }, [errorMessage]);

    const handleTagPress = useCallback((tag: string) => {
        setSelectedTag(tag);
    }, []);

    const handlePost = useCallback(async () => {
        if (!text.trim()) return;
        Keyboard.dismiss();
        setStep('GENERATING');

        progressWidth.value = withTiming(90, { duration: 8000, easing: Easing.linear });

        try {
            await createEntry({
                content: text,
                mode: selectedTag,
                tag: selectedTag
            });

            progressWidth.value = withTiming(100, { duration: 400 }, () => {
                runOnJS(closeSheet)();
            });
        } catch (error) {
            setStep('INPUT');
            progressWidth.value = 0;

            let errorMsg = 'Failed to create journal entry. Please try again.';

            // Handle daily limit error
            if (isAxiosError(error)) {
                const errorData = error.response?.data;

                if (error.response?.status === 429) {
                    // Daily journal limit reached
                    errorMsg = 'Daily journal limit reached. Please try again tomorrow.';
                    Toast.show({
                        type: 'error',
                        text1: 'Daily Limit Reached',
                        text2: errorMsg,
                        visibilityTime: 4000,
                        position: 'top',
                    });
                } else if (error.response?.status === 400) {
                    errorMsg = 'Failed to create journal entry';
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: errorMsg,
                        visibilityTime: 3000,
                        position: 'top',
                    });
                } else {
                    errorMsg = 'Failed to create journal entry';
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: errorMsg,
                        visibilityTime: 3000,
                        position: 'top',
                    });
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: errorMsg,
                    visibilityTime: 3000,
                    position: 'top',
                });
            }

            setErrorMessage(errorMsg);
        }
    }, [text, selectedTag, createEntry, closeSheet]);


    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value}%`,
    }));

    if (!visible) return null;

    return (
        <Modal transparent animationType="none" visible={visible}>
            <KeyboardAwareWrapper extraScrollHeight={0}>
                {/* Backdrop */}
                <View className="flex-1 bg-black/30 justify-end">
                    <Animated.View
                        style={[sheetStyle, { height: SHEET_HEIGHT }]}
                        className="bg-white rounded-t-[40px] p-6 shadow-2xl"
                    >
                        {step === 'INPUT' && (
                            <>
                                {/* Header */}
                                <View className="flex-row justify-between mb-6">
                                    <View className="flex-row flex-wrap gap-2 flex-1">
                                        {MOOD_TAGS.map((tag) => {
                                            const active = tag === selectedTag;
                                            return (
                                                <TouchableOpacity
                                                    key={tag}
                                                    onPress={() => handleTagPress(tag)}
                                                    className={`px-4 py-2 rounded-full border ${active
                                                        ? 'border-yellow-400'
                                                        : 'border-transparent bg-gray-100'
                                                        }`}
                                                >
                                                    <Text
                                                        className={`text-xs font-medium ${active ? 'text-yellow-600' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    <TouchableOpacity onPress={closeSheet}>
                                        <Ionicons name="close" size={24} />
                                    </TouchableOpacity>
                                </View>

                                {/* Input */}
                                <Text className="text-lg font-bold mb-3">
                                    What&apos;s on your mind?
                                </Text>
                                <View className="border border-gray-200 min-h-[150px] rounded-2xl mb-6 overflow-hidden">
                                    <TextInput
                                        multiline
                                        style={{ textAlignVertical: 'top', padding: 16, flex: 1 }}
                                        value={text}
                                        onChangeText={handleTextChange}
                                        placeholder="Your safe space to write from the heart."
                                    />
                                </View>


                                <View className="border border-yellow-300 rounded-xl p-4 bg-yellow-50/30">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Ionicons name="sparkles" size={18} color="#EAB308" />
                                        <Text className="text-yellow-500 font-bold text-sm">Journaling Tips</Text>
                                    </View>
                                    <View className="text-gray-600 text-sm leading-5">
                                        <Text className='text-gray-400'>• Write without judgment - let it flow</Text>
                                        <Text className='text-gray-400'>• Be honest about your feelings</Text>
                                        <Text className='text-gray-400'>• Notice patterns in your thoughts</Text>
                                        <Text className='text-gray-400'>• Celebrate small victories</Text>
                                        <Text className='text-gray-400'>• Ask yourself reflective questions</Text>
                                    </View>
                                </View>

                                {/* Error Message */}
                                {errorMessage && (
                                    <View className="my-4 border border-red-300 rounded-xl p-4 bg-red-50/30">
                                        <View className="flex-row items-center gap-2">
                                            <Ionicons name="alert-circle" size={18} color="#DC2626" />
                                            <Text className="text-red-600 text-sm flex-1">{errorMessage}</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Post */}
                                <View className="flex-1 justify-end mb-4 mt-3">
                                    <TouchableOpacity
                                        onPress={handlePost}
                                        className="h-14 bg-yellow-400 rounded-full items-center justify-center"
                                    >
                                        <Text className="font-bold text-lg">Post</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {step === 'GENERATING' && (
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-lg mb-6">
                                    Generating personalized insight
                                </Text>

                                <View className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <Animated.View
                                        style={[
                                            progressStyle,
                                            { height: '100%', backgroundColor: 'black' },
                                        ]}
                                    />
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </KeyboardAwareWrapper>
        </Modal>
    );
}
