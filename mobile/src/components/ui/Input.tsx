import type React from "react";
import { useState } from "react";
import {
	Text,
	TextInput,
	type TextInputProps,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";

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

	// Dynamic classes
	const containerClasses = "mb-4";
	let labelClasses = "text-sm font-medium text-gray-600 mb-1";
	let inputContainerClasses =
		"flex-row items-center border rounded-md bg-white min-h-[48px]";
	let inputClasses = "flex-1 text-base text-gray-900 px-4 py-2";
	let helperTextClasses = "text-xs text-gray-600 mt-1 ml-1";

	// Error states
	if (hasError) {
		labelClasses += " text-red-500";
		inputContainerClasses += " border-red-500 border-2";
		helperTextClasses += " text-red-500";
	} else if (isFocused) {
		inputContainerClasses += " border-indigo-600 border-2";
	} else {
		inputContainerClasses += " border-gray-300";
	}

	// Icon padding adjustments
	if (leftIcon) {
		inputClasses += " pl-1";
	}
	if (rightIcon) {
		inputClasses += " pr-1";
	}

	return (
		<View className={containerClasses} style={containerStyle}>
			{label && (
				<Text className={labelClasses} style={labelStyle}>
					{label}
					{required && <Text className="text-red-500"> *</Text>}
				</Text>
			)}

			<View className={inputContainerClasses}>
				{leftIcon && (
					<View className="pl-4 justify-center items-center">{leftIcon}</View>
				)}

				<TextInput
					className={inputClasses}
					style={inputStyle}
					onFocus={(e) => {
						setIsFocused(true);
						textInputProps.onFocus?.(e);
					}}
					onBlur={(e) => {
						setIsFocused(false);
						textInputProps.onBlur?.(e);
					}}
					placeholderTextColor="#9CA3AF"
					{...textInputProps}
				/>

				{rightIcon && (
					<View className="pr-4 justify-center items-center">{rightIcon}</View>
				)}
			</View>

			{(error || helperText) && (
				<Text className={helperTextClasses}>{error || helperText}</Text>
			)}
		</View>
	);
};
