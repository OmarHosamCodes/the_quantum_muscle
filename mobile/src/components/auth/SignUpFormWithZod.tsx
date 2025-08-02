import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ZodError } from "zod";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { useSignUp } from "../../hooks/useAuthQuery";
import { type SignUpFormData, signUpSchema } from "../../schemas/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PasswordStrengthIndicator } from "../ui/PasswordStrengthIndicator";
import { AuthContainer } from "./AuthContainer";

interface SignUpFormProps {
	onNavigateToSignIn: () => void;
}

export const SignUpFormWithZod: React.FC<SignUpFormProps> = ({
	onNavigateToSignIn,
}) => {
	const [formData, setFormData] = useState<SignUpFormData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		userType: "trainee",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof SignUpFormData, string>>
	>({});

	const signUpMutation = useSignUp();

	const updateField = (field: keyof SignUpFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const validateForm = (): boolean => {
		try {
			signUpSchema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof ZodError) {
				const newErrors: Partial<Record<keyof SignUpFormData, string>> = {};

				error.issues.forEach((issue) => {
					if (issue.path.length > 0) {
						const field = issue.path[0] as keyof SignUpFormData;
						newErrors[field] = issue.message;
					}
				});

				setErrors(newErrors);
			}
			return false;
		}
	};

	const handleSignUp = async () => {
		if (!validateForm()) return;

		try {
			await signUpMutation.mutateAsync(formData);
			Alert.alert(
				"Account Created",
				"Please check your email to verify your account before signing in.",
				[{ text: "OK", onPress: onNavigateToSignIn }],
			);
		} catch (error) {
			Alert.alert(
				"Sign Up Error",
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		}
	};

	return (
		<AuthContainer>
			<View className="items-center mb-16">
				<Text className="text-3xl font-bold text-gray-900 mb-2">
					Create Account
				</Text>
				<Text className="text-lg text-gray-600">
					Join our fitness community
				</Text>
			</View>

			<View className="mb-8">
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
							color={errors.name ? "#EF4444" : "#9CA3AF"}
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
							color={errors.email ? "#EF4444" : "#9CA3AF"}
						/>
					}
					required
				/>

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
							color={errors.password ? "#EF4444" : "#9CA3AF"}
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

				{formData.password.length > 0 && (
					<PasswordStrengthIndicator password={formData.password} />
				)}

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
							color={errors.confirmPassword ? "#EF4444" : "#9CA3AF"}
						/>
					}
					rightIcon={
						<TouchableOpacity
							onPress={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							<Ionicons
								name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
								size={20}
								color="#9CA3AF"
							/>
						</TouchableOpacity>
					}
					required
				/>

				<View style={styles.userTypeContainer}>
					<Text style={styles.userTypeLabel}>I am a:</Text>
					<View style={styles.userTypeOptions}>
						<TouchableOpacity
							style={[
								styles.userTypeOption,
								formData.userType === "trainee" && styles.userTypeOptionActive,
							]}
							onPress={() => updateField("userType", "trainee")}
						>
							<Ionicons
								name="person-outline"
								size={20}
								color={
									formData.userType === "trainee"
										? Colors.primary
										: Colors.textSecondary
								}
							/>
							<Text
								style={[
									styles.userTypeOptionText,
									formData.userType === "trainee" &&
										styles.userTypeOptionTextActive,
								]}
							>
								Trainee
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.userTypeOption,
								formData.userType === "trainer" && styles.userTypeOptionActive,
							]}
							onPress={() => updateField("userType", "trainer")}
						>
							<Ionicons
								name="barbell-outline"
								size={20}
								color={
									formData.userType === "trainer"
										? Colors.primary
										: Colors.textSecondary
								}
							/>
							<Text
								style={[
									styles.userTypeOptionText,
									formData.userType === "trainer" &&
										styles.userTypeOptionTextActive,
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
					loading={signUpMutation.isPending}
					disabled={signUpMutation.isPending}
					fullWidth
					style={{ marginTop: 24 }}
				/>
			</View>

			<View className="items-center">
				<Text className="text-base text-gray-600">
					Already have an account?{" "}
					<TouchableOpacity onPress={onNavigateToSignIn}>
						<Text className="text-indigo-600 font-medium">Sign in</Text>
					</TouchableOpacity>
				</Text>
			</View>
		</AuthContainer>
	);
};

const styles = StyleSheet.create({
	userTypeContainer: {
		marginVertical: Spacing.lg,
	},
	userTypeLabel: {
		fontSize: Typography.base,
		fontWeight: Typography.semibold,
		color: Colors.textPrimary,
		marginBottom: Spacing.sm,
	},
	userTypeOptions: {
		flexDirection: "row",
		gap: Spacing.md,
	},
	userTypeOption: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.backgroundSecondary,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "transparent",
		paddingVertical: Spacing.md,
		paddingHorizontal: Spacing.lg,
		gap: Spacing.sm,
	},
	userTypeOptionActive: {
		backgroundColor: Colors.primary + "10",
		borderColor: Colors.primary,
	},
	userTypeOptionText: {
		fontSize: Typography.base,
		fontWeight: Typography.medium,
		color: Colors.textSecondary,
	},
	userTypeOptionTextActive: {
		color: Colors.primary,
		fontWeight: "600",
	},
});
