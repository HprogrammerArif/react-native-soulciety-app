import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

type Errors = {
  email?: string;
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useUser();

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const newErrors: Errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- NEXT ----------------
  const handleNext = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      await forgotPassword({ email });

      Toast.show({
        type: "success",
        text1: "OTP sent 📩",
        text2: "Please check your email",
      });

      router.push({
        pathname: "/(auth)/reset-password",
        params: { email: email, redirect: "reset-pass" },
      });
    } catch (error: any) {
      const data = error?.response?.data;

      let message = "Something went wrong";

      if (data?.non_field_errors?.length) {
        message = data.non_field_errors[0];
      } else if (data?.detail) {
        message = data.detail;
      } else if (data?.message) {
        message = data.message;
      }

      Toast.show({
        type: "error",
        text1: "Request failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-10">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 -ml-2 justify-center items-center mb-4"
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <Text className="text-2xl font-bold">Forgot Password</Text>

      {/* Subtitle */}
      <Text className="text-gray-500 leading-5 mt-2">
        Enter the email of your account and we will send an OTP to reset
        your password.
      </Text>

      {/* Email */}
      <View className="mt-8">
        <Text className="font-semibold mb-2">Enter Email</Text>
        <TextInput
          placeholder="example@gmail.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          className={`border rounded-xl px-4 py-3 text-base ${errors.email ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.email && (
          <Text className="text-red-500 text-sm mt-1">
            {errors.email}
          </Text>
        )}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        disabled={loading}
        onPress={handleNext}
        className={`mt-auto py-4 mb-10 rounded-xl items-center ${loading ? "bg-gray-300" : "bg-yellow-400"
          }`}
      >
        <Text className="text-black text-base font-semibold">
          {loading ? "Sending..." : "Next"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
