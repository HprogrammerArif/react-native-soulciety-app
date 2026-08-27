import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Google Sign-In OAuth configuration
// Web Client ID from google-services.json (oauth_client with client_type: 3)
// Note: google-services.json is kept ONLY for Google OAuth, not for Firebase services
GoogleSignin.configure({
  webClientId:
    "298994560137-6hp6e107r9kr58q24comvvgg3tjkimvj.apps.googleusercontent.com",
  offlineAccess: true,
});

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    // console.log("Google user", userInfo);

    return {
      email: userInfo.data?.user.email || "",
      fullName: userInfo.data?.user.name || userInfo.data?.user.givenName || "",
      image: userInfo.data?.user.photo || undefined,
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}
