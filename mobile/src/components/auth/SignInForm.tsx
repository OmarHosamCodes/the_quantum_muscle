import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail } from "../../utils/validation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AuthContainer } from "./AuthContainer";

interface SignInFormProps {
	onNavigateToSignUp: () => void;
	onNavigateToForgotPassword: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
	onNavigateToSignUp,
	onNavigateToForgotPassword,
}) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const { signIn, actionLoading } = useAuth();

	const validateForm = (): boolean => {
		let isValid = true;

		// Reset errors
		setEmailError("");
		setPasswordError("");

		// Validate email
		if (!email.trim()) {
			setEmailError("Email is required");
			isValid = false;
		} else if (!validateEmail(email)) {
			setEmailError("Please enter a valid email address");
			isValid = false;
		}

		// Validate password
		if (!password.trim()) {
			setPasswordError("Password is required");
			isValid = false;
		}

		return isValid;
	};

	const handleSignIn = async () => {
		if (!validateForm()) return;

		const result = await signIn({ email: email.trim(), password });

		if (!result.success) {
			Alert.alert(
				"Sign In Error",
				result.error || "An unexpected error occurred",
			);
		}
	};

	return (
		<AuthContainer>
			<View className="items-center mb-16">
				<Text className="text-3xl font-bold text-gray-900 mb-2">
					Welcome Back
				</Text>
				<Text className="text-lg text-gray-600">Sign in to your account</Text>
			</View>

			<View className="mb-8">
				<Input
					label="Email"
					value={email}
					onChangeText={(text) => {
						setEmail(text);
						if (emailError) setEmailError("");
					}}
					error={emailError}
					placeholder="Enter your email"
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
					leftIcon={
						<Ionicons
							name="mail-outline"
							size={20}
							color={emailError ? "#EF4444" : "#9CA3AF"}
						/>
					}
					required
				/>

				<Input
					label="Password"
					value={password}
					onChangeText={(text) => {
						setPassword(text);
						if (passwordError) setPasswordError("");
					}}
					error={passwordError}
					placeholder="Enter your password"
					secureTextEntry={!showPassword}
					autoCapitalize="none"
					autoCorrect={false}
					leftIcon={
						<Ionicons
							name="lock-closed-outline"
							size={20}
							color={passwordError ? "#EF4444" : "#9CA3AF"}
						/>
					}
					rightIcon={
						<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
							<Ionicons
								name={showPassword ? "eye-off-outline" : "eye-outline"}
								size={20}
								color="#9CA3AF"
							/>
						</TouchableOpacity>
					}
					required
				/>

				<TouchableOpacity
					className="self-end mb-6"
					onPress={onNavigateToForgotPassword}
				>
					<Text className="text-sm text-indigo-600 font-medium">
						Forgot your password?
					</Text>
				</TouchableOpacity>

				<Button
					title="Sign In"
					onPress={handleSignIn}
					loading={actionLoading}
					disabled={actionLoading}
					fullWidth
					style={{ marginTop: 16 }}
				/>
			</View>

			<View className="items-center">
				<Text className="text-base text-gray-600">
					Don't have an account?{" "}
					<TouchableOpacity onPress={onNavigateToSignUp}>
						<Text className="text-indigo-600 font-medium">Sign up</Text>
					</TouchableOpacity>
				</Text>
			</View>
		</AuthContainer>
	);
};
