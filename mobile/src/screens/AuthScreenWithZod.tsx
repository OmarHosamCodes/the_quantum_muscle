import type React from "react";
import { useState } from "react";
import { StatusBar, Text, View } from "react-native";
import { ForgotPasswordFormWithZod } from "../components/auth/ForgotPasswordFormWithZod";
import { SignInFormWithZod } from "../components/auth/SignInFormWithZod";
import { SignUpFormWithZod } from "../components/auth/SignUpFormWithZod";
import { Colors } from "../constants/theme";

type AuthScreenType = "signIn" | "signUp" | "forgotPassword";

export const AuthScreenWithZod: React.FC = () => {
	const [currentScreen, setCurrentScreen] = useState<AuthScreenType>("signIn");

	console.log("AuthScreenWithZod rendering, currentScreen:", currentScreen);

	const renderScreen = () => {
		switch (currentScreen) {
			case "signIn":
				return (
					<SignInFormWithZod
						onNavigateToSignUp={() => setCurrentScreen("signUp")}
						onNavigateToForgotPassword={() =>
							setCurrentScreen("forgotPassword")
						}
					/>
				);
			case "signUp":
				return (
					<SignUpFormWithZod
						onNavigateToSignIn={() => setCurrentScreen("signIn")}
					/>
				);
			case "forgotPassword":
				return (
					<ForgotPasswordFormWithZod
						onNavigateToSignIn={() => setCurrentScreen("signIn")}
					/>
				);
			default:
				return <Text>Unknown screen type</Text>;
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
			{renderScreen()}
		</View>
	);
};
