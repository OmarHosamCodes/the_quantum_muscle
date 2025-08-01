import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Spacing, Typography } from "../../constants/theme";
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
			<View style={styles.header}>
				<Text style={styles.title}>Welcome Back</Text>
				<Text style={styles.subtitle}>Sign in to your account</Text>
			</View>

			<View style={styles.form}>
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
							color={emailError ? Colors.error : Colors.gray400}
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
							color={passwordError ? Colors.error : Colors.gray400}
						/>
					}
					rightIcon={
						<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
							<Ionicons
								name={showPassword ? "eye-off-outline" : "eye-outline"}
								size={20}
								color={Colors.gray400}
							/>
						</TouchableOpacity>
					}
					required
				/>

				<TouchableOpacity
					style={styles.forgotPassword}
					onPress={onNavigateToForgotPassword}
				>
					<Text style={styles.forgotPasswordText}>Forgot your password?</Text>
				</TouchableOpacity>

				<Button
					title="Sign In"
					onPress={handleSignIn}
					loading={actionLoading}
					disabled={actionLoading}
					fullWidth
					style={styles.signInButton}
				/>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>
					Don't have an account?{" "}
					<TouchableOpacity onPress={onNavigateToSignUp}>
						<Text style={styles.footerLink}>Sign up</Text>
					</TouchableOpacity>
				</Text>
			</View>
		</AuthContainer>
	);
};

const styles = StyleSheet.create({
	header: {
		alignItems: "center",
		marginBottom: Spacing.xxxl,
	},

	title: {
		fontSize: Typography["3xl"],
		fontWeight: Typography.bold,
		color: Colors.textPrimary,
		marginBottom: Spacing.sm,
	},

	subtitle: {
		fontSize: Typography.lg,
		color: Colors.textSecondary,
	},

	form: {
		marginBottom: Spacing.xl,
	},

	forgotPassword: {
		alignSelf: "flex-end",
		marginBottom: Spacing.lg,
	},

	forgotPasswordText: {
		fontSize: Typography.sm,
		color: Colors.primary,
		fontWeight: Typography.medium,
	},

	signInButton: {
		marginTop: Spacing.md,
	},

	footer: {
		alignItems: "center",
	},

	footerText: {
		fontSize: Typography.base,
		color: Colors.textSecondary,
	},

	footerLink: {
		color: Colors.primary,
		fontWeight: Typography.medium,
	},
});
