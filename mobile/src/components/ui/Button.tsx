import type React from "react";
import {
	ActivityIndicator,
	Text,
	type TextStyle,
	TouchableOpacity,
	type ViewStyle,
} from "react-native";

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

	// Base classes
	let buttonClasses =
		"rounded-md items-center justify-center flex-row shadow-sm";
	let textClasses = "font-medium text-center";

	// Variant classes
	switch (variant) {
		case "primary":
			buttonClasses += " bg-indigo-600 border border-indigo-600";
			textClasses += " text-white";
			break;
		case "secondary":
			buttonClasses += " bg-emerald-600 border border-emerald-600";
			textClasses += " text-white";
			break;
		case "outline":
			buttonClasses += " bg-transparent border border-indigo-600";
			textClasses += " text-indigo-600";
			break;
		case "ghost":
			buttonClasses += " bg-transparent border-0";
			textClasses += " text-indigo-600";
			break;
	}

	// Size classes
	switch (size) {
		case "small":
			buttonClasses += " px-3 py-2 min-h-[36px]";
			textClasses += " text-sm";
			break;
		case "medium":
			buttonClasses += " px-4 py-3 min-h-[48px]";
			textClasses += " text-base";
			break;
		case "large":
			buttonClasses += " px-5 py-4 min-h-[56px]";
			textClasses += " text-lg";
			break;
	}

	// Full width
	if (fullWidth) {
		buttonClasses += " w-full";
	}

	// Disabled state
	if (isDisabled) {
		buttonClasses += " bg-gray-300 border-gray-300 opacity-60";
	}

	const activityIndicatorColor =
		variant === "outline" || variant === "ghost" ? "#6366F1" : "#FFFFFF";

	return (
		<TouchableOpacity
			className={buttonClasses}
			style={style}
			onPress={onPress}
			disabled={isDisabled}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator size="small" color={activityIndicatorColor} />
			) : (
				<Text className={textClasses} style={textStyle}>
					{title}
				</Text>
			)}
		</TouchableOpacity>
	);
};
