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

// const BASE_URL = "http://10.10.13.69:8000";
const BASE_URL = Constants.expoConfig?.extra?.BACKEND_URL;

export const registerUser = async (
  payload: RegisterPayload,
): Promise<AuthResponse> => {
  console.log("Register Payload: ", payload);
  const { data } = await axios.post(`${BASE_URL}/api/auth/register/`, payload);
  return data;
};

export const loginUser = async (
  payload: LoginPayload,
): Promise<AuthResponse> => {
  console.log("Login Payload: ", payload);
  const { data } = await axios.post(`${BASE_URL}/api/auth/login/`, payload);
  console.log("Login Response", data);
  return data;
};

export const getProfile = async (): Promise<Profile> => {
  const { data } = await api.get("/api/profile/users/");
  console.log("Data from get Profile", data);
  return data;
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<AuthResponse> => {
  console.log("Forget Pass Payload: ", payload);
  const { data } = await api.post("/api/auth/forgot-password/", payload);
  return data;
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<AuthResponse> => {
  console.log("Reset Pass Payload: ", payload);
  const { data } = await api.post("/api/auth/reset-password/", payload);
  return data;
};

export const verifyOtp = async (payload: VerifyOtpPayload) => {
  console.log("Verify OTP Payload: ", payload);
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/verify-otp/`,
    payload,
  );
  return data;
};

export const resendOtp = async (
  payload: ResendOtpPayload,
): Promise<AuthResponse> => {
  console.log("Resend OTP Payload: ", payload);
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/resend-otp/`,
    payload,
  );
  return data;
};

export const setNewPassword = async (
  payload: SetPasswordPayload,
): Promise<AuthResponse> => {
  console.log("Set Pass Payload: ", payload);
  const { data } = await api.patch("/accounts/api/change-password", payload);
  //   console.log(data);
  return data;
};

export const updateProfile = async (payload: FormData): Promise<Profile> => {
  console.log("Update Profile Payload: ", payload);

  const { data } = await api.put("/api/profile/users/", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // REMOVE transformRequest: (data) => data
  });

  return data;
};

export const googleLogin = async (payload: {
  email: string;
  full_name?: string;
  image?: string;
}): Promise<AuthResponse> => {
  console.log("Google Login Payload: ", payload);
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/social/google/`,
    payload,
  );
  console.log("Google Login Response", data);
  return data;
};

export const appleLogin = async (payload: {
  email: string;
  full_name?: string;
  image?: string;
}): Promise<AuthResponse> => {
  console.log("Apple Login Payload: ", payload);
  const { data } = await axios.post(
    `${BASE_URL}/api/auth/social/apple/`,
    payload,
  );
  console.log("Apple Login Response", data);
  return data;
};
