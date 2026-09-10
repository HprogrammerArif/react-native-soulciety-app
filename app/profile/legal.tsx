import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIVACY_POLICY = `Last Updated: September 2026

1. INFORMATION WE COLLECT

Soulciety ("we", "us", or "our") collects the following information:

• Account Information: Full name, email address, phone number, and profile picture when you create an account.
• Mood Data: Your daily mood selections to personalize your experience.
• Journal Entries: Content you write in your personal journal.
• Chat Messages: Conversations with our AI assistant to provide spiritual guidance.
• Community Content: Posts, comments, and likes you create in the community section.
• Usage Data: App usage patterns, device information, and crash reports.
• Authentication Data: Login tokens and session information.

2. HOW WE USE YOUR INFORMATION

We use your information to:
• Provide and improve the Soulciety app experience.
• Personalize content and spiritual guidance based on your mood and preferences.
• Enable community features (posts, comments, follows).
• Send notifications about app activity and updates.
• Ensure security and prevent abuse.
• Comply with legal obligations.

3. AI CHAT DATA

Your conversations with our AI assistant are processed to generate responses. We do not use your chat data to train AI models. Chat history is stored on our servers and can be deleted at any time through the app.

4. DATA SHARING

We do not sell your personal information. We may share data with:
• Service providers (hosting, analytics, AI processing) under strict data protection agreements.
• Law enforcement when required by law.
• Other users only through content you choose to post publicly in the community.

5. DATA RETENTION

• Account data is retained until you delete your account.
• Journal and chat data can be deleted individually or by deleting your account.
• Community posts remain until you delete them or your account.

6. YOUR RIGHTS

You have the right to:
• Access your personal data.
• Correct inaccurate data.
• Delete your account and all associated data.
• Export your data.
• Opt out of non-essential notifications.

7. DATA SECURITY

We use industry-standard security measures including encrypted connections (HTTPS), secure token-based authentication, and access controls to protect your data.

8. CHILDREN'S PRIVACY

Soulciety is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us with personal data, please contact us.

9. CHANGES TO THIS POLICY

We may update this policy periodically. We will notify you of significant changes through the app or email.

10. CONTACT US

For privacy-related questions or to exercise your rights:
Email: bodruddozaredoy@gmail.com
Phone: +1(754)248-2759`;

const TERMS_OF_SERVICE = `Last Updated: September 2026

1. ACCEPTANCE OF TERMS

By downloading, installing, or using Soulciety, you agree to these Terms of Service. If you do not agree, do not use the app.

2. DESCRIPTION OF SERVICE

Soulciety is a spiritual wellness and community app that provides:
• AI-powered spiritual guidance and chat.
• Daily mood tracking.
• Personal journal.
• Community features for sharing and connecting.
• A 30-day healing journey.
• Spiritual content (videos, affirmations).

3. ACCOUNT REGISTRATION

• You must provide accurate and complete information.
• You are responsible for maintaining the security of your account.
• You must be at least 13 years old to use Soulciety.
• One person may not maintain more than one account.

4. AI DISCLAIMER

IMPORTANT: The AI assistant in Soulciety is for spiritual guidance and personal reflection only. It is NOT a substitute for professional medical, psychological, or psychiatric advice, diagnosis, or treatment. If you are experiencing a mental health crisis, please contact a licensed mental health professional or emergency services immediately.

5. USER CONTENT

• You retain ownership of content you create (posts, journal entries, comments).
• By posting content in the community, you grant Soulciety a non-exclusive license to display that content within the app.
• You are responsible for content you post and must not post harmful, abusive, or illegal content.
• We reserve the right to remove content that violates these terms or our community guidelines.

6. COMMUNITY GUIDELINES

Users must:
• Be respectful and supportive of others.
• Not post hate speech, harassment, or discriminatory content.
• Not share explicit, violent, or inappropriate content.
• Not spam, promote, or solicit other users.
• Not impersonate other users or public figures.
• Report content that violates these guidelines.

7. INTELLECTUAL PROPERTY

All Soulciety branding, design, and proprietary content are owned by Soulciety. You may not copy, modify, or distribute our intellectual property without permission.

8. ACCOUNT DELETION

You may delete your account at any time through the app settings. Upon deletion:
• Your profile, journal entries, and chat history will be permanently deleted.
• Community posts may be retained in anonymized form.
• Some data may be retained for legal compliance purposes.

9. LIMITATION OF LIABILITY

Soulciety is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the app, including but not limited to decisions made based on AI guidance.

10. TERMINATION

We reserve the right to suspend or terminate accounts that violate these terms.

11. GOVERNING LAW

These terms are governed by the laws of the United States of America.

12. CHANGES TO TERMS

We may update these terms periodically. Continued use of the app constitutes acceptance of updated terms.

13. CONTACT

For questions about these terms:
Email: bodruddozaredoy@gmail.com
Phone: +1(754)248-2759`;

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const isPrivacy = type === "privacy";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center items-center"
        >
          <Ionicons name="chevron-back" size={22} color="black" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-bold">
          {isPrivacy ? "Privacy Policy" : "Terms of Service"}
        </Text>

        <View className="w-10" />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="text-gray-700 text-[15px] leading-7">
          {isPrivacy ? PRIVACY_POLICY : TERMS_OF_SERVICE}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
