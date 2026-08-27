// types/user.types.ts
export type UserRole = "Customer";
export interface User {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin" | "scholar";
  avatar?: string;
  verified?: boolean;
}

export interface RegisterPayload {
  email?: string;
  full_name?: string;
  password: string;
  confirm_password: string;
}

export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  new_password: string;
  confirm_password: string;
  email: string;
  otp: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}
export interface ResendOtpPayload {
  email?: string;
  phone_number?: string;
}

export interface SetPasswordPayload {
  new_password: string;
}

export interface SocialLoginPayload {
  email: string;
  full_name?: string;
  image?: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email: string;
  phone_number: string;
  profile_picture_url: string | null;
  notifications_enabled: boolean;
  current_mood: string | null;
  current_mood_display: string;
  member_since: string; // ISO date string
}

export interface UpdateCustomerProfilePayload {
  full_name?: string;
  email?: string;
  phone_number?: string;
  image?: string;
  location?: string;
  lat?: string;
  lng?: string;
}
