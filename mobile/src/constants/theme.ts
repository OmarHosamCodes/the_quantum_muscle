export const Colors = {
	primary: "#6366F1", // Indigo
	primaryDark: "#4F46E5",
	primaryLight: "#818CF8",

	secondary: "#10B981", // Emerald
	secondaryDark: "#059669",
	secondaryLight: "#34D399",

	accent: "#F59E0B", // Amber
	accentDark: "#D97706",
	accentLight: "#FCD34D",

	success: "#10B981",
	warning: "#F59E0B",
	error: "#EF4444",
	info: "#3B82F6",

	// Grays
	gray50: "#F9FAFB",
	gray100: "#F3F4F6",
	gray200: "#E5E7EB",
	gray300: "#D1D5DB",
	gray400: "#9CA3AF",
	gray500: "#6B7280",
	gray600: "#4B5563",
	gray700: "#374151",
	gray800: "#1F2937",
	gray900: "#111827",

	// Text colors
	textPrimary: "#111827",
	textSecondary: "#6B7280",
	textTertiary: "#9CA3AF",
	textInverse: "#FFFFFF",

	// Background colors
	background: "#FFFFFF",
	backgroundSecondary: "#F9FAFB",
	backgroundTertiary: "#F3F4F6",
	backgroundDark: "#1F2937",

	// Border colors
	border: "#E5E7EB",
	borderLight: "#F3F4F6",
	borderDark: "#D1D5DB",

	// Component specific
	card: "#FFFFFF",
	cardBorder: "#E5E7EB",
	cardShadow: "rgba(0, 0, 0, 0.1)",

	input: "#FFFFFF",
	inputBorder: "#D1D5DB",
	inputFocus: "#6366F1",
	inputError: "#EF4444",

	button: "#6366F1",
	buttonHover: "#4F46E5",
	buttonDisabled: "#9CA3AF",

	overlay: "rgba(0, 0, 0, 0.5)",

	// Dark mode variants
	dark: {
		primary: "#818CF8",
		background: "#111827",
		backgroundSecondary: "#1F2937",
		backgroundTertiary: "#374151",
		textPrimary: "#F9FAFB",
		textSecondary: "#D1D5DB",
		textTertiary: "#9CA3AF",
		card: "#1F2937",
		cardBorder: "#374151",
		border: "#374151",
		input: "#1F2937",
		inputBorder: "#4B5563",
	},
};

export const Spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
	xxxl: 64,
};

export const Typography = {
	// Font sizes
	xs: 12,
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	"2xl": 24,
	"3xl": 30,
	"4xl": 36,
	"5xl": 48,

	// Font weights
	light: "300" as const,
	normal: "400" as const,
	medium: "500" as const,
	semibold: "600" as const,
	bold: "700" as const,
	extrabold: "800" as const,

	// Line heights
	lineHeight: {
		tight: 1.25,
		normal: 1.5,
		relaxed: 1.75,
	},
};

export const BorderRadius = {
	none: 0,
	sm: 4,
	md: 8,
	lg: 12,
	xl: 16,
	"2xl": 24,
	full: 9999,
};

export const Shadows = {
	sm: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	md: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	lg: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	xl: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 8,
	},
};
