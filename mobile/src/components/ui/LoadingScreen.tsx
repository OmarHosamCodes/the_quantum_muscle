import type React from "react";
import {
	ActivityIndicator,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { Colors, Spacing, Typography } from "../../constants/theme";

interface LoadingScreenProps {
	message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
	message = "Loading...",
}) => {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<ActivityIndicator
					size="large"
					color={Colors.primary}
					style={styles.spinner}
				/>
				<Text style={styles.message}>{message}</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},

	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: Spacing.lg,
	},

	spinner: {
		marginBottom: Spacing.lg,
	},

	message: {
		fontSize: Typography.base,
		color: Colors.textSecondary,
		textAlign: "center",
	},
});
