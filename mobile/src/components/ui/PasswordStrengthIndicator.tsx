import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
	BorderRadius,
	Colors,
	Spacing,
	Typography,
} from "../../constants/theme";
import { getPasswordStrength } from "../../utils/validation";

interface PasswordStrengthIndicatorProps {
	password: string;
	showStrength?: boolean;
}

export const PasswordStrengthIndicator: React.FC<
	PasswordStrengthIndicatorProps
> = ({ password, showStrength = true }) => {
	const { score, feedback, color } = getPasswordStrength(password);

	if (!password || !showStrength) return null;

	return (
		<View style={styles.container}>
			<View style={styles.strengthBar}>
				<View
					style={[
						styles.strengthSegment,
						{ backgroundColor: score > 0 ? color : Colors.gray200 },
					]}
				/>
				<View
					style={[
						styles.strengthSegment,
						{ backgroundColor: score > 1 ? color : Colors.gray200 },
					]}
				/>
				<View
					style={[
						styles.strengthSegment,
						{ backgroundColor: score > 2 ? color : Colors.gray200 },
					]}
				/>
				<View
					style={[
						styles.strengthSegment,
						{ backgroundColor: score > 3 ? color : Colors.gray200 },
					]}
				/>
				<View
					style={[
						styles.strengthSegment,
						{ backgroundColor: score > 4 ? color : Colors.gray200 },
					]}
				/>
				<View
					style={[
						styles.strengthSegment,
						{ backgroundColor: score > 5 ? color : Colors.gray200 },
					]}
				/>
			</View>
			<Text style={[styles.strengthText, { color }]}>{feedback}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: Spacing.xs,
	},

	strengthBar: {
		flexDirection: "row",
		height: 4,
		borderRadius: BorderRadius.sm,
		backgroundColor: Colors.gray200,
		overflow: "hidden",
		marginBottom: Spacing.xs,
	},

	strengthSegment: {
		flex: 1,
		marginRight: 2,
		borderRadius: BorderRadius.sm,
	},

	strengthText: {
		fontSize: Typography.xs,
		fontWeight: Typography.medium,
		textAlign: "right",
	},
});
