import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const Layout = {
	window: {
		width: screenWidth,
		height: screenHeight,
	},
	isSmallDevice: screenWidth < 375,
	isLargeDevice: screenWidth >= 414,

	// Common layout values
	headerHeight: 60,
	tabBarHeight: 80,
	statusBarHeight: 44, // iOS default, should be dynamic

	// Content padding
	contentPadding: 16,
	sectionPadding: 24,

	// Form dimensions
	inputHeight: 48,
	buttonHeight: 48,
	buttonHeightSmall: 36,
	buttonHeightLarge: 56,

	// Card dimensions
	cardPadding: 16,
	cardMargin: 8,

	// Icon sizes
	iconXS: 12,
	iconSM: 16,
	iconMD: 24,
	iconLG: 32,
	iconXL: 48,
};

export const Breakpoints = {
	sm: 375,
	md: 414,
	lg: 768,
	xl: 1024,
};
