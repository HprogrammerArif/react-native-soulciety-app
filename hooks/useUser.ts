import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  forgotPassword,
  getProfile,
  loginUser,
  registerUser,
  resendOtp,
  resetPassword,
  setNewPassword,
  updateProfile,
  verifyOtp,
  googleLogin,
  appleLogin,
} from "@/services/user.api";

import {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  Profile,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  SetPasswordPayload,
  SocialLoginPayload,
  VerifyOtpPayload,
} from "@/types/user.types";

import { clearProfile, storeProfile } from "@/lib/profileStorage";

export const useUser = () => {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for token on mount and update state
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      setHasToken(!!token);
      setIsCheckingAuth(false);
    };
    checkToken();
  }, []);

  /* ---------------- REGISTER ---------------- */
  const registerMutation = useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: registerUser,
  });

  /* ---------------- LOGIN ---------------- */
  const loginMutation = useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      console.log("Login Response Data", data);
      if (data?.access) {
        await AsyncStorage.setItem("accessToken", data.access);
        await AsyncStorage.setItem("refreshToken", data.refresh);
        setHasToken(true); // Update token state

        // fetch & cache profile immediately
        console.log("Get profile is calling");
        const profile = await getProfile();
        console.log("After profile is calling");
        await storeProfile(profile);

        queryClient.setQueryData(["profile"], profile);
      }
    },
  });

  /* ---------------- CUSTOMER PROFILE ---------------- */
  const profileQuery = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      // const stored = await getStoredProfile();
      // if (stored) return stored;

      const profile = await getProfile();
      console.log("Profile from hook", profile);
      // await storeProfile(profile);
      return profile;
    },
    enabled: hasToken === true, // Only fetch profile if user has a token
    retry: false,
    initialData: () => queryClient.getQueryData(["profile"]),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  /* ---------------- UPDATE CUSTOMER PROFILE ---------------- */
  const updateProfileMutation = useMutation<Profile, Error, FormData>({
    mutationFn: updateProfile,
    onSuccess: async (updatedProfile) => {
      await storeProfile(updatedProfile);
      queryClient.setQueryData(["profile"], updatedProfile);
    },
  });

  /* ---------------- FORGOT PASSWORD ---------------- */
  const forgotPasswordMutation = useMutation<
    AuthResponse,
    Error,
    ForgotPasswordPayload
  >({
    mutationFn: forgotPassword,
  });

  /* ---------------- RESET PASSWORD ---------------- */
  const resetPasswordMutation = useMutation<
    AuthResponse,
    Error,
    ResetPasswordPayload
  >({
    mutationFn: resetPassword,
  });

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtpMutation = useMutation<AuthResponse, Error, VerifyOtpPayload>({
    mutationFn: verifyOtp,
    onSuccess: async (data) => {
      // if (data?.access) {
      //   await AsyncStorage.setItem("accessToken", data.access);
      //   setHasToken(true); // Update token state
      //   const profile = await getProfile();
      //   await storeProfile(profile);
      //   queryClient.setQueryData(["profile"], profile);
      // }
    },
    onError: async (data) => {
      console.log(data.message);
    },
  });

  /* ---------------- RESEND OTP ---------------- */
  const resendOtpMutation = useMutation<AuthResponse, Error, ResendOtpPayload>({
    mutationFn: resendOtp,
  });

  /* ---------------- SET PASSWORD ---------------- */
  const setPasswordMutation = useMutation<
    AuthResponse,
    Error,
    SetPasswordPayload
  >({
    mutationFn: setNewPassword,
  });

  /* ---------------- GOOGLE LOGIN ---------------- */
  const googleLoginMutation = useMutation<
    AuthResponse,
    Error,
    SocialLoginPayload
  >({
    mutationFn: googleLogin,
    onSuccess: async (data) => {
      console.log("Google Login Response Data", data);
      if (data?.access) {
        await AsyncStorage.setItem("accessToken", data.access);
        await AsyncStorage.setItem("refreshToken", data.refresh);
        setHasToken(true);

        const profile = await getProfile();
        await storeProfile(profile);
        queryClient.setQueryData(["profile"], profile);
      }
    },
  });

  /* ---------------- APPLE LOGIN ---------------- */
  const appleLoginMutation = useMutation<
    AuthResponse,
    Error,
    SocialLoginPayload
  >({
    mutationFn: appleLogin,
    onSuccess: async (data) => {
      console.log("Apple Login Response Data", data);
      if (data?.access) {
        await AsyncStorage.setItem("accessToken", data.access);
        await AsyncStorage.setItem("refreshToken", data.refresh);
        setHasToken(true);

        const profile = await getProfile();
        await storeProfile(profile);
        queryClient.setQueryData(["profile"], profile);
      }
    },
  });

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await clearProfile();
    setHasToken(false); // Update token state

    queryClient.removeQueries({
      queryKey: ["profile"],
    });
  };

  return {
    /* queries */
    profile: profileQuery,
    profileState: profileQuery,
    isCheckingAuth,

    /* actions */
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    resendOtp: resendOtpMutation.mutateAsync,
    setPassword: setPasswordMutation.mutateAsync,
    logout,
    updateProfile: updateProfileMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutateAsync,
    appleLogin: appleLoginMutation.mutateAsync,

    /* states */
    registerState: registerMutation,
    loginState: loginMutation,
    forgotPasswordState: forgotPasswordMutation,
    resetPasswordState: resetPasswordMutation,
    verifyOtpState: verifyOtpMutation,
    resendOtpState: resendOtpMutation,
    setPasswordState: setPasswordMutation,
    updateProfileState: updateProfileMutation,
    googleLoginState: googleLoginMutation,
    appleLoginState: appleLoginMutation,
  };
};
