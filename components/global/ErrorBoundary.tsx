import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-white justify-center items-center px-8">
          <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-6">
            <Ionicons name="warning-outline" size={40} color="#EF4444" />
          </View>

          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Something went wrong
          </Text>

          <Text className="text-gray-500 text-center text-base leading-6 mb-8">
            We're sorry, something unexpected happened. Please try again.
          </Text>

          {__DEV__ && this.state.error && (
            <View className="bg-red-50 rounded-xl p-4 mb-6 w-full">
              <Text className="text-red-600 text-xs font-mono">
                {this.state.error.message}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-yellow-400 px-8 py-4 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
