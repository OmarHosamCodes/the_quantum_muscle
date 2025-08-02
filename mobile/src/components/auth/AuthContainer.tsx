import type React from "react";
import {
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	View,
} from "react-native";

interface AuthContainerProps {
	children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					className="flex-1"
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: "center",
						paddingHorizontal: 24,
					}}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View className="w-full max-w-[400px] self-center">{children}</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};
