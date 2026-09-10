import { api } from "@/lib/axios";
import {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  Profile,
  RegisterPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  SetPasswordPayload,
  VerifyOtpPayload,
} from "@/types/user.types";
import axios from "axios";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  if (__DEV__) console.log("Register Payload: ", { email: payload.email, full_name: payload.full_name });
  const { data } = await axios.post(`${BASE_URL}/api/auth/register/`, payload);
  return data;
};

export const loginUser = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  if (__DEV__) console.log("Login Payload: ", { email: payload.email });
  const { data } = await axios.post(`${BASE_URL}/api/auth/login/`, payload);
  if (__DEV__) console.log("Login Response received");
  return data;
};

export const getProfile = async (): Promise<Profile> => {
  const { data } = await api.get("/api/profile/users/");
  return data;
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<AuthResponse> => {
  if (__DEV__) console.log("Forget Pass Payload: ", payload);
  const { data } = await api.post("/api/auth/forgot-password/", payload);
  return data;
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<AuthResponse> => {
  if (__DEV__) console.log("Reset Pass Payload: ", { email: payload.email });
  const { data } = await api.post("/api/auth/reset-password/", payload);
  return data;
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  if (__DEV__) console.log("Verify OTP Payload: ", { email: payload.email });
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/verify-otp/`,
    payload,
  );
  return data;
};

export const resendOtp = async (
  payload: ResendOtpPayload,
): Promise<AuthResponse> => {
  if (__DEV__) console.log("Resend OTP Payload: ", { email: payload.email });
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/resend-otp/`,
    payload,
  );
  return data;
};

export const setNewPassword = async (
  payload: SetPasswordPayload,
): Promise<AuthResponse> => {
  const { data } = await api.patch("/accounts/api/change-password", payload);
  return data;
};

export const updateProfile = async (payload: FormData): Promise<Profile> => {
  if (__DEV__) console.log("Updating profile...");

  const { data } = await api.put("/api/profile/users/", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const googleLogin = async (payload: {
  email: string;
  full_name?: string;
  image?: string;
}): Promise<AuthResponse> => {
  if (__DEV__) console.log("Google Login Payload: ", { email: payload.email });
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/social/google/`,
    payload,
  );
  if (__DEV__) console.log("Google Login Response received");
  return data;
};

export const appleLogin = async (payload: {
  email: string;
  full_name?: string;
  image?: string;
}): Promise<AuthResponse> => {
  if (__DEV__) console.log("Apple Login Payload: ", { email: payload.email });
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/social/apple/`,
    payload,
  );
  if (__DEV__) console.log("Apple Login Response received");
  return data;
};

/**
 * Delete the current user's account and all associated data.
 * This is required by both Apple App Store and Google Play Store.
 */
export const deleteUserAccount = async (): Promise<void> => {
  await api.delete("/api/auth/account/delete/");
};
