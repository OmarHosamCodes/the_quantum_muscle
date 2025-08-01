import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import {
	validateEmail,
	validateName,
	validatePassword,
	validatePasswordConfirmation,
} from "../../utils/validation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PasswordStrengthIndicator } from "../ui/PasswordStrengthIndicator";
import { AuthContainer } from "./AuthContainer";

interface SignUpFormProps {
	onNavigateToSignIn: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
	onNavigateToSignIn,
}) => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		userType: "trainee" as "trainee" | "trainer",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { signUp, actionLoading } = useAuth();

	const updateField = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = (): boolean => {
		const newErrors = {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		};

		// Validate name
		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		} else if (!validateName(formData.name)) {
			newErrors.name = "Name must be between 2 and 50 characters";
		}

		// Validate email
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!validateEmail(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		// Validate password
		if (!formData.password) {
			newErrors.password = "Password is required";
		} else {
			const passwordValidation = validatePassword(formData.password);
			if (!passwordValidation.isValid) {
				newErrors.password = passwordValidation.errors[0];
			}
		}

		// Validate password confirmation
		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (
			!validatePasswordConfirmation(formData.password, formData.confirmPassword)
		) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.values(newErrors).every((error) => !error);
	};

	const handleSignUp = async () => {
		if (!validateForm()) return;

		const result = await signUp({
			email: formData.email.trim(),
			password: formData.password,
			name: formData.name.trim(),
			userType: formData.userType,
		});

		if (result.success) {
			Alert.alert(
				"Account Created",
				"Please check your email to verify your account before signing in.",
				[{ text: "OK", onPress: onNavigateToSignIn }],
			);
		} else {
			Alert.alert(
				"Sign Up Error",
				result.error || "An unexpected error occurred",
			);
		}
	};

	return (
		<AuthContainer>
			<View style={styles.header}>
				<Text style={styles.title}>Create Account</Text>
				<Text style={styles.subtitle}>Join the Quantum Muscle community</Text>
			</View>

			<View style={styles.form}>
				<Input
					label="Full Name"
					value={formData.name}
					onChangeText={(text) => updateField("name", text)}
					error={errors.name}
					placeholder="Enter your full name"
					autoCapitalize="words"
					autoCorrect={false}
					leftIcon={
						<Ionicons
							name="person-outline"
							size={20}
							color={errors.name ? Colors.error : Colors.gray400}
						/>
					}
					required
				/>

				<Input
					label="Email"
					value={formData.email}
					onChangeText={(text) => updateField("email", text)}
					error={errors.email}
					placeholder="Enter your email"
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
					leftIcon={
						<Ionicons
							name="mail-outline"
							size={20}
							color={errors.email ? Colors.error : Colors.gray400}
						/>
					}
					required
				/>

				<View>
					<Input
						label="Password"
						value={formData.password}
						onChangeText={(text) => updateField("password", text)}
						error={errors.password}
						placeholder="Create a strong password"
						secureTextEntry={!showPassword}
						autoCapitalize="none"
						autoCorrect={false}
						leftIcon={
							<Ionicons
								name="lock-closed-outline"
								size={20}
								color={errors.password ? Colors.error : Colors.gray400}
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
					<PasswordStrengthIndicator
						password={formData.password}
						showStrength={formData.password.length > 0}
					/>
				</View>

				<Input
					label="Confirm Password"
					value={formData.confirmPassword}
					onChangeText={(text) => updateField("confirmPassword", text)}
					error={errors.confirmPassword}
					placeholder="Confirm your password"
					secureTextEntry={!showConfirmPassword}
					autoCapitalize="none"
					autoCorrect={false}
					leftIcon={
						<Ionicons
							name="lock-closed-outline"
							size={20}
							color={errors.confirmPassword ? Colors.error : Colors.gray400}
						/>
					}
					rightIcon={
						<TouchableOpacity
							onPress={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							<Ionicons
								name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
								size={20}
								color={Colors.gray400}
							/>
						</TouchableOpacity>
					}
					required
				/>

				<View style={styles.userTypeContainer}>
					<Text style={styles.userTypeLabel}>I am a:</Text>
					<View style={styles.userTypeButtons}>
						<TouchableOpacity
							style={[
								styles.userTypeButton,
								formData.userType === "trainee" && styles.userTypeButtonActive,
							]}
							onPress={() => updateField("userType", "trainee")}
						>
							<Ionicons
								name="fitness-outline"
								size={20}
								color={
									formData.userType === "trainee"
										? Colors.textInverse
										: Colors.gray600
								}
							/>
							<Text
								style={[
									styles.userTypeButtonText,
									formData.userType === "trainee" &&
										styles.userTypeButtonTextActive,
								]}
							>
								Trainee
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.userTypeButton,
								formData.userType === "trainer" && styles.userTypeButtonActive,
							]}
							onPress={() => updateField("userType", "trainer")}
						>
							<Ionicons
								name="barbell-outline"
								size={20}
								color={
									formData.userType === "trainer"
										? Colors.textInverse
										: Colors.gray600
								}
							/>
							<Text
								style={[
									styles.userTypeButtonText,
									formData.userType === "trainer" &&
										styles.userTypeButtonTextActive,
								]}
							>
								Trainer
							</Text>
						</TouchableOpacity>
					</View>
				</View>

				<Button
					title="Create Account"
					onPress={handleSignUp}
					loading={actionLoading}
					disabled={actionLoading}
					fullWidth
					style={styles.signUpButton}
				/>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>
					Already have an account?{" "}
					<TouchableOpacity onPress={onNavigateToSignIn}>
						<Text style={styles.footerLink}>Sign in</Text>
					</TouchableOpacity>
				</Text>
			</View>
		</AuthContainer>
	);
};

const styles = StyleSheet.create({
	header: {
		alignItems: "center",
		marginBottom: Spacing.xl,
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
		textAlign: "center",
	},

	form: {
		marginBottom: Spacing.lg,
	},

	userTypeContainer: {
		marginBottom: Spacing.md,
	},

	userTypeLabel: {
		fontSize: Typography.sm,
		fontWeight: Typography.medium,
		color: Colors.textSecondary,
		marginBottom: Spacing.sm,
	},

	userTypeButtons: {
		flexDirection: "row",
		gap: Spacing.sm,
	},

	userTypeButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.sm,
		borderWidth: 1,
		borderColor: Colors.border,
		borderRadius: 8,
		backgroundColor: Colors.background,
	},

	userTypeButtonActive: {
		backgroundColor: Colors.primary,
		borderColor: Colors.primary,
	},

	userTypeButtonText: {
		fontSize: Typography.sm,
		fontWeight: Typography.medium,
		color: Colors.gray600,
		marginLeft: Spacing.xs,
	},

	userTypeButtonTextActive: {
		color: Colors.textInverse,
	},

	signUpButton: {
		marginTop: Spacing.lg,
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
