import type React from "react";
import {
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { Colors, Spacing } from "../../constants/theme";

interface AuthContainerProps {
	children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={styles.keyboardAvoidingView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.content}>{children}</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},

	keyboardAvoidingView: {
		flex: 1,
	},

	scrollView: {
		flex: 1,
	},

	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		paddingHorizontal: Spacing.lg,
	},

	content: {
		width: "100%",
		maxWidth: 400,
		alignSelf: "center",
	},
});
