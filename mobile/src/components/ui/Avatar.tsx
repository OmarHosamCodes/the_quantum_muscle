import { Image, StyleSheet, Text, View } from "react-native";

type AvatarProps = {
	source?: { uri: string };
	size?: number;
	fallback?: string;
};

export const Avatar = ({ source, size = 50, fallback }: AvatarProps) => {
	if (source) {
		return (
			<Image
				source={source}
				style={[
					styles.avatar,
					{ width: size, height: size, borderRadius: size / 2 },
				]}
			/>
		);
	}

	// Fallback avatar with initials
	return (
		<View
			style={[
				styles.avatar,
				styles.fallbackAvatar,
				{ width: size, height: size, borderRadius: size / 2 },
			]}
		>
			<Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
				{fallback || "?"}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	avatar: {
		backgroundColor: "#E0E0E0",
	},
	fallbackAvatar: {
		backgroundColor: "#0891b2",
		justifyContent: "center",
		alignItems: "center",
	},
	fallbackText: {
		color: "#ffffff",
		fontWeight: "600",
	},
});

export default Avatar;
