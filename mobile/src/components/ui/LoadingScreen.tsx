import type React from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";

interface LoadingScreenProps {
	message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
	message = "Loading...",
}) => {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-1 justify-center items-center px-6">
				<ActivityIndicator size="large" color="#6366F1" className="mb-6" />
				<Text className="text-base text-gray-600 text-center">{message}</Text>
			</View>
		</SafeAreaView>
	);
};
