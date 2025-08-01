import type React from "react";
import { useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	type TextInputProps,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";
import {
	BorderRadius,
	Colors,
	Spacing,
	Typography,
} from "../../constants/theme";

interface InputProps extends Omit<TextInputProps, "style"> {
	label?: string;
	error?: string;
	helperText?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	containerStyle?: ViewStyle;
	inputStyle?: TextStyle;
	labelStyle?: TextStyle;
	required?: boolean;
}

export const Input: React.FC<InputProps> = ({
	label,
	error,
	helperText,
	leftIcon,
	rightIcon,
	containerStyle,
	inputStyle,
	labelStyle,
	required = false,
	...textInputProps
}) => {
	const [isFocused, setIsFocused] = useState(false);

	const hasError = !!error;

	return (
		<View style={[styles.container, containerStyle]}>
			{label && (
				<Text style={[styles.label, labelStyle, hasError && styles.labelError]}>
					{label}
					{required && <Text style={styles.required}> *</Text>}
				</Text>
			)}

			<View
				style={[
					styles.inputContainer,
					isFocused && styles.inputContainerFocused,
					hasError && styles.inputContainerError,
				]}
			>
				{leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

				<TextInput
					style={[
						styles.input,
						leftIcon ? styles.inputWithLeftIcon : null,
						rightIcon ? styles.inputWithRightIcon : null,
						inputStyle,
					]}
					onFocus={(e) => {
						setIsFocused(true);
						textInputProps.onFocus?.(e);
					}}
					onBlur={(e) => {
						setIsFocused(false);
						textInputProps.onBlur?.(e);
					}}
					placeholderTextColor={Colors.gray400}
					{...textInputProps}
				/>

				{rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
			</View>

			{(error || helperText) && (
				<Text style={[styles.helperText, hasError && styles.errorText]}>
					{error || helperText}
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: Spacing.md,
	},

	label: {
		fontSize: Typography.sm,
		fontWeight: Typography.medium,
		color: Colors.textSecondary,
		marginBottom: Spacing.xs,
	},

	labelError: {
		color: Colors.error,
	},

	required: {
		color: Colors.error,
	},

	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Colors.inputBorder,
		borderRadius: BorderRadius.md,
		backgroundColor: Colors.input,
		minHeight: 48,
	},

	inputContainerFocused: {
		borderColor: Colors.inputFocus,
		borderWidth: 2,
	},

	inputContainerError: {
		borderColor: Colors.inputError,
		borderWidth: 2,
	},

	input: {
		flex: 1,
		fontSize: Typography.base,
		color: Colors.textPrimary,
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.sm,
	},

	inputWithLeftIcon: {
		paddingLeft: Spacing.xs,
	},

	inputWithRightIcon: {
		paddingRight: Spacing.xs,
	},

	leftIcon: {
		paddingLeft: Spacing.md,
		justifyContent: "center",
		alignItems: "center",
	},

	rightIcon: {
		paddingRight: Spacing.md,
		justifyContent: "center",
		alignItems: "center",
	},

	helperText: {
		fontSize: Typography.xs,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
		marginLeft: Spacing.xs,
	},

	errorText: {
		color: Colors.error,
	},
});
