import { useUser } from "@/hooks/useUser";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import KeyboardAwareWrapper from "@/components/global/KeyboardAwareWrapper";

type Errors = {
  password?: string;
  confirmPassword?: string;
};

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{
    email: string;
    otp: string;
  }>();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(120);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);

  const { resetPassword } = useUser();
  const { resendOtp } = useUser();

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

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email });
      setTimer(120);

      Toast.show({
        type: "success",
        text1: "OTP sent",
        text2: "Check your email",
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to resend OTP",
      });
    }
  };

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const newErrors: Errors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ---------------- CHANGE PASSWORD ----------------
  const handleChangePassword = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter the 6-digit code",
      });
      return;
    }
    if (!validate()) return;

    setLoading(true);

    try {
      await resetPassword({
        email,
        otp: code,
        new_password: password,
        confirm_password: confirmPassword,
      });

      Toast.show({
        type: "success",
        text1: "Password changed successfully 🎉",
        text2: "You can now log in with your new password",
      });

      router.replace("/(auth)/login");
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
        text1: "Reset failed",
        text2: message,
      });
    } finally {
      setLoading(false);
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
              className="flex-1 rounded-xl bg-gray-100 text-center text-2xl font-semibold"
            />
          ))}
        </View>


        {/* Resend */}
        <View className="mt-5">
          {timer > 0 ? (
            <Text className="text-gray-600">
              Resend code in{" "}
              <Text className="text-yellow-600 font-semibold">
                {timer}s
              </Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text className="text-yellow-600 font-semibold">
                Resend Code
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold mt-10">Enter new password</Text>

        {/* Password */}
        <View className="mt-3 mb-5">
          <Text className="font-semibold mb-2">Password</Text>
          <View
            className={`flex-row items-center rounded-xl px-4 border ${errors.password ? "border-red-500" : "border-gray-300"
              }`}
          >
            <Feather name="lock" size={22} color="#444" />
            <TextInput
              placeholder="********"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="flex-1 py-3 pl-3 text-base"
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? (
                <EyeOff size={20} color="#555" />
              ) : (
                <Eye size={20} color="#555" />
              )}
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.password}
            </Text>
          )}
        </View>

        {/* Confirm Password */}
        <View className="mb-5">
          <Text className="font-semibold mb-2">Confirm Password</Text>
          <View
            className={`flex-row items-center rounded-xl px-4 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
          >
            <Feather name="lock" size={22} color="#444" />
            <TextInput
              placeholder="********"
              secureTextEntry={!confirmVisible}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
              }}
              className="flex-1 py-3 pl-3 text-base"
            />
            <TouchableOpacity
              onPress={() => setConfirmVisible(!confirmVisible)}
            >
              {confirmVisible ? (
                <EyeOff size={20} color="#555" />
              ) : (
                <Eye size={20} color="#555" />
              )}
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleChangePassword}
          className={`mt-auto mb-5 py-4 rounded-xl items-center ${loading ? "bg-gray-300" : "bg-yellow-400"}`}
        >
          <Text className="text-black text-base font-semibold">
            {loading ? "Changing..." : "Change Password"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAwareWrapper>
  );
}
