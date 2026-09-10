import CustomPrimaryButton from "@/components/global/CustomPrimaryButton";
import KeyboardAwareWrapper from "@/components/global/KeyboardAwareWrapper";
import { useUser } from "@/hooks/useUser";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

type FormErrors = {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};


export default function SignupScreen() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});


    const { register } = useUser();

    // ---------------- VALIDATION ----------------
    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
            Toast.show({
                type: "info",
                text1: "Invalid Password",
                text2: "Password must be at least 8 characters",
            });
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // ---------------- SIGNUP ----------------
    const handleSignup = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            await register({
                full_name: fullName,
                email,
                password,
                confirm_password: confirmPassword,
            });

            Toast.show({
                type: "success",
                text1: "Account created!!",
                text2: "Please verify with OTP",
            });


            router.push({ pathname: "/(auth)/otp", params: { email: email } });
        } catch (error: any) {
            if (__DEV__) console.log("RESPONSE_DATA", error?.response?.data);
            Toast.show({
                type: "error",
                text1: "Signup failed",
                text2: error?.response?.data?.non_field_errors?.[0] || "Something went wrong",
            });

        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAwareWrapper>
            <SafeAreaView className="flex-1 bg-white px-6">
                {/* Logo */}
                <View className="items-center mt-10">
                    <Image
                        source={require("@/assets/images/splash-logo.png")}
                        resizeMode="contain"
                        className="w-60 h-30"
                    />
                </View>

                <Text className="text-3xl font-bold mb-8 text-center">Sign up</Text>

                {/* Full Name */}
                <View className="mb-5">
                    <Text className="font-semibold mb-2">Full Name</Text>
                    <TextInput
                        placeholder="Enter your full name" value={fullName}
                        onChangeText={(text) => {
                            setFullName(text);
                            setErrors((prev) => ({ ...prev, fullName: undefined }));
                        }}
                        className={`border rounded-xl px-4 py-3 text-base ${errors.fullName ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {errors.fullName && (
                        <Text className="text-red-500 text-sm mt-1">
                            {errors.fullName}
                        </Text>
                    )}
                </View>


                {/* Email */}
                <View className="mb-5">
                    <Text className="font-semibold mb-2">Email</Text>
                    <TextInput
                        placeholder="Enter your email"
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


                {/* Password */}
                <View className="mb-5">
                    <Text className="font-semibold mb-2">Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4">
                        <Feather name="lock" size={22} color="#444" />
                        <TextInput
                            placeholder="********"
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={setPassword}
                            className="flex-1 py-3 pl-3 text-base text-black"
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
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4">
                        <Feather name="lock" size={22} color="#444" />
                        <TextInput
                            placeholder="********"
                            secureTextEntry={!confirmVisible}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            className="flex-1 py-3 pl-3 text-base text-black"
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

                <CustomPrimaryButton
                    title={"Sign Up"}
                    onPress={handleSignup}
                    disabled={loading}
                    loading={loading}
                />

                {/* Login */}
                <View className="mt-6 flex-row justify-center">
                    <Text className="text-gray-600">Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/login")}>
                        <Text className="text-yellow-600 font-semibold">Login</Text>
                    </TouchableOpacity>
                </View>

                {/* Legal Links */}
                <View className="mt-4 mb-6 items-center">
                    <Text className="text-gray-400 text-xs text-center leading-5">
                        By signing up, you agree to our{" "}
                        <Text
                            className="text-yellow-600 underline"
                            onPress={() => router.push({ pathname: "/profile/legal", params: { type: "terms" } })}
                        >
                            Terms of Service
                        </Text>
                        {" "}and{" "}
                        <Text
                            className="text-yellow-600 underline"
                            onPress={() => router.push({ pathname: "/profile/legal", params: { type: "privacy" } })}
                        >
                            Privacy Policy
                        </Text>
                    </Text>
                </View>
            </SafeAreaView>
        </KeyboardAwareWrapper>
    );
}
