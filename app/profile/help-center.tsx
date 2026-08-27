import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Linking,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const CUSTOMER_NUMBER = "+1(754)248-2759";
const WHATSAPP_NUMBER = "+1(754)248-2759";

export default function HelpCenterScreen() {
    const insets = useSafeAreaInsets();
    const [active, setActive] = useState<"customer" | "whatsapp" | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openPhoneCall = () => {
        Linking.openURL(`tel:${CUSTOMER_NUMBER}`);
    };

    const openWhatsApp = () => {
        const digitsOnly = WHATSAPP_NUMBER.replace(/\D/g, "");
        const url = `https://wa.me/${digitsOnly}`;
        Linking.openURL(url);
    };

    const openModal = (type: "customer" | "whatsapp") => {
        setActive(type);
        setModalVisible(true);
    };

    return (
        <SafeAreaView
            className="flex-1 bg-white"
        >
            {/* Header */}
            <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center items-center">
                    <Ionicons name="chevron-back" size={22} color="black" />
                </TouchableOpacity>

                <Text className="flex-1 text-center text-lg font-bold">
                    Help Center
                </Text>

                <View className="w-10" />
            </View>

            {/* Cards */}
            <View className="px-5 mt-6 gap-4">

                {/* Customer Service */}
                <TouchableOpacity
                    onPress={() => openModal("customer")}
                    className={`flex-row items-center gap-3 px-4 py-4 rounded-xl border 
            ${active === "customer" ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white"}
          `}
                >
                    <Feather
                        name="headphones"
                        size={22}
                        color={active === "customer" ? "#EAB308" : "black"}
                    />
                    <Text className="text-base font-medium">Customer Services</Text>
                </TouchableOpacity>

                {/* WhatsApp */}
                <TouchableOpacity
                    onPress={() => openModal("whatsapp")}
                    className={`flex-row items-center gap-3 px-4 py-4 rounded-xl 
            ${active === "whatsapp" ? "border-yellow-400 bg-yellow-50 border " : "bg-white  border border-gray-200"}
          `}
                >
                    <Ionicons
                        name="logo-whatsapp"
                        size={22}
                        color={active === "whatsapp" ? "#EAB308" : "black"}
                    />
                    <Text className="text-base font-medium">WhatsApp</Text>
                </TouchableOpacity>

            </View>

            {/* MODAL BOTTOM SHEET */}
            <Modal
                animationType="slide"
                visible={modalVisible}
                transparent={true}
            >
                <View className="flex-1 justify-end bg-black/30">
                    <View className="bg-white rounded-t-3xl p-6 shadow-xl" style={{ paddingBottom: insets.bottom }}>

                        {/* Title */}
                        <Text className="text-lg font-bold mb-4">
                            {active === "customer" ? "Customer Service" : "WhatsApp Support"}
                        </Text>

                        {/* Info Text */}
                        <Text className="text-gray-600 mb-6 leading-6">
                            {active === "customer"
                                ? "Call our customer support team for any inquiries or issues."
                                : "Chat with our WhatsApp support team instantly."}
                        </Text>

                        {/* Action Button */}
                        <View className="flex-row w-full items-center gap-3" style={{ paddingBottom: insets.bottom + 5 }}>
                            <TouchableOpacity
                                onPress={active === "customer" ? openPhoneCall : openWhatsApp}
                                className="bg-yellow-400 py-4 rounded-xl items-center w-1/2"
                            >
                                <Text className="text-white font-semibold text-lg">
                                    {active === "customer" ? "Call Now" : "Open WhatsApp"}
                                </Text>
                            </TouchableOpacity>

                            {/* Close Button */}
                            <TouchableOpacity
                                onPress={() => {setModalVisible(false);setActive(null)}}
                                className=" py-4 rounded-xl bg-gray-100 items-center w-1/2"
                            >
                                <Text className="text-gray-500 font-semibold text-lg">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
