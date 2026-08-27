import React from "react";
import {
    ActivityIndicator,
    GestureResponderEvent,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

interface Props {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string; // tailwind styles
  textClassName?: string; // tailwind for text
  style?: ViewStyle; // RN style override
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function CustomPrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  className = "",
  textClassName = "",
  style,
  textStyle,
  leftIcon,
  rightIcon,
}: Props) {
  const isDisabled = disabled || loading;

   function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}


  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        "bg-yellow-400 py-4 rounded-xl flex-row items-center justify-center",
        isDisabled && "opacity-60",
        className
      )}
      style={style}
      activeOpacity={0.8}
    >
      {/* Left Icon */}
      {leftIcon && <>{leftIcon}</>}

      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text
          className={cn("text-white font-semibold text-lg", textClassName)}
          style={textStyle}
        >
          {title}
        </Text>
      )}

      {/* Right Icon */}
      {rightIcon && <>{rightIcon}</>}
    </TouchableOpacity>
  );
}
