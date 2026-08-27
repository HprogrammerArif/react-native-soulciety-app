import KeyboardAwareWrapper from "@/components/global/KeyboardAwareWrapper";
import { useUser } from "@/hooks/useUser";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function OtpScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);

  const { email } = useLocalSearchParams<{ email: string }>();
  const { redirect } = useLocalSearchParams<{ redirect: string }>();
  const { verifyOtp, resendOtp } = useUser();

  const insets = useSafeAreaInsets();

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ---------------- OTP INPUT ----------------
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter the 6-digit code",
      });
      return;
    }
    if (redirect === "reset-pass")
      return router.replace({
        pathname: "/(auth)/reset-password",
        params: { email, otp: code },
      });

    setLoading(true);

    try {
      console.log(code);
      await verifyOtp({
        email,
        otp: code,
      });

      // console.log(res)
      Toast.show({
        type: "success",
        text1: "Verified successfully 🎉",
        text2: "Your account is now active",
      });

      if (redirect === "reset-pass") {
        router.replace({
          pathname: "/(auth)/reset-password",
          params: { email, otp: code },
        });
      } else {
        router.replace("/(auth)/login");
      }
    } catch (error: any) {
      // console.log(JSON.stringify(error?.response, null, 2))
      const data = error?.response?.data;
      console.log(error);

      let errorMessage = "Invalid or expired OTP";

      if (data?.non_field_errors?.length) {
        errorMessage = data.non_field_errors[0];
      } else if (data?.message) {
        errorMessage = data.message;
      }

      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESEND OTP ----------------
  const handleResendOtp = async () => {
    try {
      await resendOtp({ email });
      setTimer(120);

      Toast.show({
        type: "success",
        text1: "OTP sent",
        text2: "Check your email",
      });
    } catch (err: any) {
      console.log(err?.response?.data);
      Toast.show({
        type: "error",
        text1: "Failed to resend OTP",
      });
    }
  };

  return (
    <KeyboardAwareWrapper>
      <SafeAreaView className="flex-1 bg-white px-6 pt-10">
        {/* Title */}
        <Text className="text-2xl font-bold">OTP Code Verification</Text>
        <Text className="text-gray-500 mt-2">
          Code has been sent to {email}
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row justify-between items-center gap-3 mt-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputs.current[index] = ref;
              }}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(val) => handleOtpChange(val, index)}
              className="flex-1 rounded-xl bg-gray-100 text-center py-4 px-3 text-2xl font-semibold"
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleVerifyOtp}
          className={`mt-10 py-4 rounded-xl ${loading ? "bg-gray-300" : "bg-yellow-500"
            }`}
        >
          <Text className="text-center text-white font-semibold text-lg">
            {loading ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        <View className="mt-5">
          {timer > 0 ? (
            <Text className="text-gray-600">
              Resend code in{" "}
              <Text className="text-yellow-600 font-semibold">{timer}s</Text>
            </Text>
          ) : (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text className="text-yellow-600 font-semibold">Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAwareWrapper>
  );
}
