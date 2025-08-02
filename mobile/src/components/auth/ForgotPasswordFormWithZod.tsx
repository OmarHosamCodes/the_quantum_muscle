import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { ZodError } from "zod";
import { useResetPassword } from "../../hooks/useAuthQuery";
import {
	type ResetPasswordFormData,
	resetPasswordSchema,
} from "../../schemas/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AuthContainer } from "./AuthContainer";

interface ForgotPasswordFormProps {
	onNavigateToSignIn: () => void;
}

export const ForgotPasswordFormWithZod: React.FC<ForgotPasswordFormProps> = ({
	onNavigateToSignIn,
}) => {
	const [formData, setFormData] = useState<ResetPasswordFormData>({
		email: "",
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof ResetPasswordFormData, string>>
	>({});

	const resetPasswordMutation = useResetPassword();

	const validateForm = (): boolean => {
		try {
			resetPasswordSchema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof ZodError) {
				const newErrors: Partial<Record<keyof ResetPasswordFormData, string>> =
					{};

				error.issues.forEach((issue) => {
					if (issue.path.length > 0) {
						const field = issue.path[0] as keyof ResetPasswordFormData;
						newErrors[field] = issue.message;
					}
				});

				setErrors(newErrors);
			}
			return false;
		}
	};

	const handleResetPassword = async () => {
		if (!validateForm()) return;

		try {
			await resetPasswordMutation.mutateAsync(formData);
			Alert.alert(
				"Reset Email Sent",
				"If an account with this email exists, you will receive password reset instructions.",
				[{ text: "OK", onPress: onNavigateToSignIn }],
			);
		} catch (error) {
			Alert.alert(
				"Reset Error",
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		}
	};

	const updateFormData = (
		field: keyof ResetPasswordFormData,
		value: string,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	return (
		<AuthContainer>
			<View className="items-center mb-16">
				<Text className="text-3xl font-bold text-gray-900 mb-2">
					Reset Password
				</Text>
				<Text className="text-lg text-gray-600 text-center">
					Enter your email address and we'll send you instructions to reset your
					password
				</Text>
			</View>

			<View className="mb-8">
				<Input
					label="Email"
					value={formData.email}
					onChangeText={(text) => updateFormData("email", text)}
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

				<Button
					title="Send Reset Instructions"
					onPress={handleResetPassword}
					loading={resetPasswordMutation.isPending}
					disabled={resetPasswordMutation.isPending}
					fullWidth
					style={{ marginTop: 24 }}
				/>
			</View>

			<View className="items-center">
				<Text className="text-base text-gray-600">
					Remember your password?{" "}
					<TouchableOpacity onPress={onNavigateToSignIn}>
						<Text className="text-indigo-600 font-medium">Sign in</Text>
					</TouchableOpacity>
				</Text>
			</View>
		</AuthContainer>
	);
};
