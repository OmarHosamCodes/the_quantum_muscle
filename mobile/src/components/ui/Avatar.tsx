import { Image, StyleSheet } from "react-native";

type AvatarProps = {
	source: { uri: string };
	size?: number;
};

export const Avatar = ({ source, size = 50 }: AvatarProps) => {
	return (
		<Image
			source={source}
			style={[
				styles.avatar,
				{ width: size, height: size, borderRadius: size / 2 },
			]}
		/>
	);
};

const styles = StyleSheet.create({
	avatar: {
		backgroundColor: "#E0E0E0",
	},
});

export default Avatar;
