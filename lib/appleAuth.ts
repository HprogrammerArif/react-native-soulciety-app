import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";

export async function signInWithApple() {
  try {
    // Check if Apple Authentication is available (iOS only)
    if (Platform.OS !== "ios") {
      throw new Error("Apple Sign-In is only available on iOS");
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Extract email from identityToken if not directly returned (subsequent sign-ins)
    let email = credential.email || "";

    if (!email && credential.identityToken) {
      try {
        const parts = credential.identityToken.split(".");
        if (parts.length === 3) {
          let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          while (payload.length % 4) {
            payload += "=";
          }
          let decodedStr = "";
          if (typeof atob === "function") {
            decodedStr = atob(payload);
          } else {
            // Pure JS base64 fallback
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            const lookup = new Uint8Array(256);
            for (let i = 0; i < chars.length; i++) {
              lookup[chars.charCodeAt(i)] = i;
            }
            let bufferLength = payload.length * 0.75;
            if (payload[payload.length - 1] === "=") {
              bufferLength--;
              if (payload[payload.length - 2] === "=") {
                bufferLength--;
              }
            }
            const bytes = new Uint8Array(bufferLength);
            let p = 0;
            for (let i = 0; i < payload.length; i += 4) {
              const b1 = lookup[payload.charCodeAt(i)];
              const b2 = lookup[payload.charCodeAt(i + 1)];
              const b3 = lookup[payload.charCodeAt(i + 2)];
              const b4 = lookup[payload.charCodeAt(i + 3)];
              bytes[p++] = (b1 << 2) | (b2 >> 4);
              if (p < bufferLength) bytes[p++] = ((b2 & 15) << 4) | (b3 >> 2);
              if (p < bufferLength) bytes[p++] = ((b3 & 3) << 6) | (b4 & 63);
            }
            for (let i = 0; i < bytes.length; i++) {
              decodedStr += String.fromCharCode(bytes[i]);
            }
          }
          const parsed = JSON.parse(decodedStr);
          if (parsed && parsed.email) {
            email = parsed.email;
          }
        }
      } catch (e) {
        console.error("Error parsing Apple identityToken:", e);
      }
    }

    // Combine first and last name if available
    const fullName = credential.fullName
      ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
      : (email ? email.split("@")[0] : "");

    return {
      email: email,
      fullName: fullName,
      identityToken: credential.identityToken,
    };
  } catch (error) {
    console.error("Apple Sign-In Error:", error);
    throw error;
  }
}
