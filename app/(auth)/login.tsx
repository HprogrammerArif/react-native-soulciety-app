import KeyboardAwareWrapper from "@/components/global/KeyboardAwareWrapper";
import { useUser } from "@/hooks/useUser";
import { signInWithApple } from "@/lib/appleAuth";
import { signInWithGoogle } from "@/lib/googleAuth";
import { AntDesign } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import Checkbox from "expo-checkbox";
import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

type Errors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const { login, googleLogin, appleLogin } = useUser();

  // ---------------- VALIDATION ----------------
  const validate = () => {
    const newErrors: Errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      console.log("Logging...")
      await login({
        email,
        password,
      });
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Welcome Back!",
          text2: "Login Successful.",
        });
      }, 200);
      router.replace("/(welcome)");
    } catch (error: any) {
      console.log("RESPONSE_DATA", error?.response?.data);
      // console.log("RESPONSE_DATA");
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: error?.response?.data?.non_field_errors?.[0] || "Network error!",
      });
      if (error?.response?.data?.non_field_errors?.[0] === "Account not verified. Please verify via OTP.") {
        router.push({ pathname: "/(auth)/otp", params: { email } })
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const userData = await signInWithGoogle();
      
      await googleLogin({
        email: userData.email,
        full_name: userData.fullName,
        image: userData.image,
      });

      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: "Google login successful.",
      });

      router.replace("/(welcome)");
    } catch (error: any) {
      console.log("Google Login Error", error);
      Toast.show({
        type: "error",
        text1: "Google login failed",
        text2: error?.response?.data?.detail || 
               error?.response?.data?.error || 
               error?.message || 
               "Failed to sign in with Google",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // ---------------- APPLE LOGIN ----------------
  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      Toast.show({
        type: "info",
        text1: "Not Available",
        text2: "Apple Sign-In is only available on iOS devices",
      });
      return;
    }

    setAppleLoading(true);
    try {
      const userData = await signInWithApple();
      
      await appleLogin({
        email: userData.email,
        full_name: userData.fullName,
      });

      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: "Apple login successful.",
      });

      router.replace("/(welcome)");
    } catch (error: any) {
      console.log("Apple Login Error", error);
      
      // Don't show error if user canceled
      if (error?.code === 'ERR_REQUEST_CANCELED') {
        return;
      }

      Toast.show({
        type: "error",
        text1: "Apple login failed",
        text2: error?.response?.data?.detail || 
               error?.response?.data?.error || 
               error?.message || 
               "Failed to sign in with Apple",
      });
    } finally {
      setAppleLoading(false);
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

        <Text className="text-4xl font-bold mb-8 text-center">Log In</Text>

        {/* Email */}
        <View className="mb-5">
          <Text className="font-semibold mb-2">Email</Text>
          <TextInput
            value={email}
            placeholder="Enter your email"
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

        {/* Remember + Forgot */}
        <View className="mt-2 flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Checkbox
              value={remember}
              onValueChange={setRemember}
              color={remember ? "#000" : undefined}
            />
            <Text className="text-gray-600">Remember Me</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forget-password")}
          >
            <Text className="text-gray-700 font-semibold">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          className={`mt-8 py-4 rounded-xl items-center ${loading ? "bg-gray-300" : "bg-yellow-400"
            }`}
        >
          <Text className="text-white font-semibold text-lg">
            {loading ? "Logging in..." : "Log in"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="mt-6 flex-row items-center">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-3 text-gray-500">Or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Google */}
        <TouchableOpacity 
          onPress={handleGoogleLogin}
          disabled={googleLoading || loading || appleLoading}
          className="mt-6 bg-gray-200 py-3 rounded-xl flex-row items-center justify-center gap-3"
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Image
                source={{
                  uri: "https://img.icons8.com/?size=100&id=17949&format=png&color=000000",
                }}
                className="w-5 h-5"
              />
              <Text className="font-medium">Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple */}
        <TouchableOpacity 
          onPress={handleAppleLogin}
          disabled={appleLoading || loading || googleLoading}
          className="mt-4 bg-gray-200 py-3 rounded-xl flex-row items-center justify-center gap-3"
        >
          {appleLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <AntDesign name="apple" size={19} color="black" />
              <Text className="font-medium">Continue with Apple</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Signup */}
        <View className="mt-10 flex-row justify-center">
          <Text className="text-gray-600">Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-yellow-600 font-semibold">Sign up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAwareWrapper>
  );
}
