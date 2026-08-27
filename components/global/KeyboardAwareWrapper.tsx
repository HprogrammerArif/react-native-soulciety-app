import { ReactNode } from "react";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
  extraScrollHeight?: number;
  backgroundColor?: string;
}

export default function KeyboardAwareWrapper({
  children,
  extraScrollHeight = Platform.OS === "ios" ? 100 : 120,
  backgroundColor = "#fff",
}: Props) {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={extraScrollHeight}
      contentContainerStyle={{ flexGrow: 1 }}
      // scrollEnabled={false}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor }}
      >
        {children}
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}
