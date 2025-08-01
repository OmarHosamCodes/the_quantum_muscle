import type React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	type TextStyle,
	TouchableOpacity,
	type ViewStyle,
} from "react-native";
import {
	BorderRadius,
	Colors,
	Shadows,
	Typography,
} from "../../constants/theme";

interface ButtonProps {
	title: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "small" | "medium" | "large";
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
	title,
	onPress,
	variant = "primary",
	size = "medium",
	disabled = false,
	loading = false,
	fullWidth = false,
	style,
	textStyle,
}) => {
	const isDisabled = disabled || loading;

	return (
		<TouchableOpacity
			style={[
				styles.base,
				styles[variant],
				styles[size],
				fullWidth && styles.fullWidth,
				isDisabled && styles.disabled,
				style,
			]}
			onPress={onPress}
			disabled={isDisabled}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={
						variant === "outline" || variant === "ghost"
							? Colors.primary
							: Colors.textInverse
					}
				/>
			) : (
				<Text
					style={[
						styles.text,
						styles[`${variant}Text`],
						styles[`${size}Text`],
						textStyle,
					]}
				>
					{title}
				</Text>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	base: {
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		...Shadows.sm,
	},

	// Variants
	primary: {
		backgroundColor: Colors.primary,
		borderWidth: 1,
		borderColor: Colors.primary,
	},
	secondary: {
		backgroundColor: Colors.secondary,
		borderWidth: 1,
		borderColor: Colors.secondary,
	},
	outline: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: Colors.primary,
	},
	ghost: {
		backgroundColor: "transparent",
		borderWidth: 0,
	},

	// Sizes
	small: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		minHeight: 36,
	},
	medium: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		minHeight: 48,
	},
	large: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		minHeight: 56,
	},

	// Full width
	fullWidth: {
		width: "100%",
	},

	// Disabled state
	disabled: {
		backgroundColor: Colors.gray300,
		borderColor: Colors.gray300,
		opacity: 0.6,
	},

	// Text styles
	text: {
		fontWeight: Typography.medium,
		textAlign: "center",
	},

	// Text variants
	primaryText: {
		color: Colors.textInverse,
	},
	secondaryText: {
		color: Colors.textInverse,
	},
	outlineText: {
		color: Colors.primary,
	},
	ghostText: {
		color: Colors.primary,
	},

	// Text sizes
	smallText: {
		fontSize: Typography.sm,
	},
	mediumText: {
		fontSize: Typography.base,
	},
	largeText: {
		fontSize: Typography.lg,
	},
});
