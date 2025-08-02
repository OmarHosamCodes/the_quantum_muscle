import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { ZodError } from "zod";
import { useSignIn } from "../../hooks/useAuthQuery";
import { type SignInFormData, signInSchema } from "../../schemas/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AuthContainer } from "./AuthContainer";

interface SignInFormProps {
	onNavigateToSignUp: () => void;
	onNavigateToForgotPassword: () => void;
}

export const SignInFormWithZod: React.FC<SignInFormProps> = ({
	onNavigateToSignUp,
	onNavigateToForgotPassword,
}) => {
	const [formData, setFormData] = useState<SignInFormData>({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof SignInFormData, string>>
	>({});

	const signInMutation = useSignIn();

	const validateForm = (): boolean => {
		try {
			signInSchema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof ZodError) {
				const newErrors: Partial<Record<keyof SignInFormData, string>> = {};

				error.issues.forEach((issue) => {
					if (issue.path.length > 0) {
						const field = issue.path[0] as keyof SignInFormData;
						newErrors[field] = issue.message;
					}
				});

				setErrors(newErrors);
			}
			return false;
		}
	};

	const handleSignIn = async () => {
		if (!validateForm()) return;

		try {
			await signInMutation.mutateAsync(formData);
		} catch (error) {
			Alert.alert(
				"Sign In Error",
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		}
	};

	const updateFormData = (field: keyof SignInFormData, value: string) => {
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
					Welcome Back
				</Text>
				<Text className="text-lg text-gray-600">Sign in to your account</Text>
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

				<Input
					label="Password"
					value={formData.password}
					onChangeText={(text) => updateFormData("password", text)}
					error={errors.password}
					placeholder="Enter your password"
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
					loading={signInMutation.isPending}
					disabled={signInMutation.isPending}
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
