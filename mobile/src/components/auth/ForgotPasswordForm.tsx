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

interface ForgotPasswordFormProps {
	onNavigateToSignIn: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
	onNavigateToSignIn,
}) => {
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { resetPassword, actionLoading } = useAuth();

	const validateForm = (): boolean => {
		setEmailError("");

		if (!email.trim()) {
			setEmailError("Email is required");
			return false;
		}

		if (!validateEmail(email)) {
			setEmailError("Please enter a valid email address");
			return false;
		}

		return true;
	};

	const handleResetPassword = async () => {
		if (!validateForm()) return;

		const result = await resetPassword(email.trim());

		if (result.success) {
			setIsSubmitted(true);
		} else {
			Alert.alert(
				"Reset Password Error",
				result.error || "An unexpected error occurred",
			);
		}
	};

	if (isSubmitted) {
		return (
			<AuthContainer>
				<View style={styles.successContainer}>
					<View style={styles.successIcon}>
						<Ionicons name="mail-outline" size={48} color={Colors.primary} />
					</View>
					<Text style={styles.successTitle}>Check Your Email</Text>
					<Text style={styles.successMessage}>
						We've sent a password reset link to{"\n"}
						<Text style={styles.emailText}>{email}</Text>
					</Text>
					<Text style={styles.successNote}>
						If you don't see the email, check your spam folder or try again with
						a different email address.
					</Text>

					<Button
						title="Back to Sign In"
						onPress={onNavigateToSignIn}
						fullWidth
						style={styles.backButton}
					/>

					<TouchableOpacity
						style={styles.resendContainer}
						onPress={() => setIsSubmitted(false)}
					>
						<Text style={styles.resendText}>
							Didn't receive the email?{" "}
							<Text style={styles.resendLink}>Try again</Text>
						</Text>
					</TouchableOpacity>
				</View>
			</AuthContainer>
		);
	}

	return (
		<AuthContainer>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={onNavigateToSignIn}
				>
					<Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
				</TouchableOpacity>
				<Text style={styles.title}>Reset Password</Text>
				<Text style={styles.subtitle}>
					Enter your email address and we'll send you a link to reset your
					password.
				</Text>
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

				<Button
					title="Send Reset Link"
					onPress={handleResetPassword}
					loading={actionLoading}
					disabled={actionLoading}
					fullWidth
					style={styles.resetButton}
				/>
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>
					Remember your password?{" "}
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
		marginBottom: Spacing.xxxl,
	},

	backButton: {
		alignSelf: "flex-start",
		marginBottom: Spacing.lg,
	},

	title: {
		fontSize: Typography["3xl"],
		fontWeight: Typography.bold,
		color: Colors.textPrimary,
		marginBottom: Spacing.md,
	},

	subtitle: {
		fontSize: Typography.base,
		color: Colors.textSecondary,
		lineHeight: Typography.lineHeight.relaxed * Typography.base,
	},

	form: {
		marginBottom: Spacing.xl,
	},

	resetButton: {
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

	// Success state styles
	successContainer: {
		alignItems: "center",
		paddingTop: Spacing.xxxl,
	},

	successIcon: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: Colors.primaryLight + "20",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.xl,
	},

	successTitle: {
		fontSize: Typography["2xl"],
		fontWeight: Typography.bold,
		color: Colors.textPrimary,
		marginBottom: Spacing.md,
	},

	successMessage: {
		fontSize: Typography.base,
		color: Colors.textSecondary,
		textAlign: "center",
		lineHeight: Typography.lineHeight.relaxed * Typography.base,
		marginBottom: Spacing.lg,
	},

	emailText: {
		fontWeight: Typography.medium,
		color: Colors.textPrimary,
	},

	successNote: {
		fontSize: Typography.sm,
		color: Colors.textTertiary,
		textAlign: "center",
		lineHeight: Typography.lineHeight.normal * Typography.sm,
		marginBottom: Spacing.xxxl,
	},

	resendContainer: {
		marginTop: Spacing.lg,
	},

	resendText: {
		fontSize: Typography.sm,
		color: Colors.textSecondary,
		textAlign: "center",
	},

	resendLink: {
		color: Colors.primary,
		fontWeight: Typography.medium,
	},
});
