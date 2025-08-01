import type React from "react";
import { useState } from "react";
import { StatusBar, View } from "react-native";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";
import { SignInForm } from "../components/auth/SignInForm";
import { SignUpForm } from "../components/auth/SignUpForm";
import { Colors } from "../constants/theme";

type AuthScreenType = "signIn" | "signUp" | "forgotPassword";

export const AuthScreen: React.FC = () => {
	const [currentScreen, setCurrentScreen] = useState<AuthScreenType>("signIn");

	const renderScreen = () => {
		switch (currentScreen) {
			case "signIn":
				return (
					<SignInForm
						onNavigateToSignUp={() => setCurrentScreen("signUp")}
						onNavigateToForgotPassword={() =>
							setCurrentScreen("forgotPassword")
						}
					/>
				);
			case "signUp":
				return (
					<SignUpForm onNavigateToSignIn={() => setCurrentScreen("signIn")} />
				);
			case "forgotPassword":
				return (
					<ForgotPasswordForm
						onNavigateToSignIn={() => setCurrentScreen("signIn")}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
			{renderScreen()}
		</View>
	);
};
