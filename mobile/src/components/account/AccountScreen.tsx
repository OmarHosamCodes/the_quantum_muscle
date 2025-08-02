import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import {
	Alert,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { Colors, Shadows, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export const AccountScreen: React.FC = () => {
	const { user, signOut, actionLoading } = useAuth();

	const handleSignOut = async () => {
		Alert.alert("Sign Out", "Are you sure you want to sign out?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Sign Out",
				style: "destructive",
				onPress: async () => {
					const result = await signOut();
					if (!result.success) {
						Alert.alert("Error", result.error || "Failed to sign out");
					}
				},
			},
		]);
	};

	if (!user) return null;

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.header}>
					<View style={styles.avatarContainer}>
						<View style={styles.avatar}>
							<Ionicons name="person" size={40} color={Colors.primary} />
						</View>
						<View style={styles.userTypeBadge}>
							<Ionicons
								name={user.user_type === "trainer" ? "barbell" : "fitness"}
								size={12}
								color={Colors.textInverse}
							/>
						</View>
					</View>

					<Text style={styles.userName}>{user.name}</Text>
					<Text style={styles.userEmail}>{user.email}</Text>
					<Text style={styles.userType}>
						{user.user_type === "trainer"
							? "Personal Trainer"
							: "Fitness Enthusiast"}
					</Text>
				</View>

				<View style={styles.content}>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Account Details</Text>
						<View style={styles.card}>
							<View style={styles.infoRow}>
								<View style={styles.infoLabel}>
									<Ionicons
										name="mail-outline"
										size={20}
										color={Colors.gray600}
									/>
									<Text style={styles.infoLabelText}>Email</Text>
								</View>
								<Text style={styles.infoValue}>{user.email}</Text>
							</View>

							<View style={styles.infoRow}>
								<View style={styles.infoLabel}>
									<Ionicons
										name="person-outline"
										size={20}
										color={Colors.gray600}
									/>
									<Text style={styles.infoLabelText}>Name</Text>
								</View>
								<Text style={styles.infoValue}>{user.name}</Text>
							</View>

							<View style={styles.infoRow}>
								<View style={styles.infoLabel}>
									<Ionicons
										name={
											user.user_type === "trainer"
												? "barbell-outline"
												: "fitness-outline"
										}
										size={20}
										color={Colors.gray600}
									/>
									<Text style={styles.infoLabelText}>Role</Text>
								</View>
								<Text style={styles.infoValue}>
									{user.user_type === "trainer"
										? "Personal Trainer"
										: "Trainee"}
								</Text>
							</View>

							<View style={styles.infoRow}>
								<View style={styles.infoLabel}>
									<Ionicons
										name="calendar-outline"
										size={20}
										color={Colors.gray600}
									/>
									<Text style={styles.infoLabelText}>Member Since</Text>
								</View>
								<Text style={styles.infoValue}>
									{new Date(user.created_at).toLocaleDateString()}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Actions</Text>
						<View style={styles.card}>
							<Button
								title="Edit Profile"
								// variant="outline"
								onPress={() => {
									// TODO: Navigate to edit profile screen
									Alert.alert(
										"Coming Soon",
										"Profile editing will be available soon!",
									);
								}}
								style={styles.actionButton}
							/>

							<Button
								title="Change Password"
								// variant="outline"
								onPress={() => {
									// TODO: Navigate to change password screen
									Alert.alert(
										"Coming Soon",
										"Password change will be available soon!",
									);
								}}
								style={styles.actionButton}
							/>

							<Button
								title="Sign Out"
								variant="secondary"
								onPress={handleSignOut}
								loading={actionLoading}
								disabled={actionLoading}
								style={{ ...styles.actionButton, ...styles.signOutButton }}
								textStyle={styles.signOutButtonText}
							/>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.backgroundSecondary,
	},

	scrollView: {
		flex: 1,
	},

	scrollContent: {
		paddingBottom: Spacing.xxxl,
	},

	header: {
		alignItems: "center",
		paddingTop: Spacing.xxxl,
		paddingHorizontal: Spacing.lg,
		paddingBottom: Spacing.xl,
		backgroundColor: Colors.background,
	},

	avatarContainer: {
		position: "relative",
		marginBottom: Spacing.lg,
	},

	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: Colors.primaryLight + "20",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 3,
		borderColor: Colors.primary + "30",
	},

	userTypeBadge: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: Colors.background,
	},

	userName: {
		fontSize: Typography["2xl"],
		fontWeight: Typography.bold,
		color: Colors.textPrimary,
		marginBottom: Spacing.xs,
	},

	userEmail: {
		fontSize: Typography.base,
		color: Colors.textSecondary,
		marginBottom: Spacing.xs,
	},

	userType: {
		fontSize: Typography.sm,
		color: Colors.primary,
		fontWeight: Typography.medium,
		backgroundColor: Colors.primaryLight + "20",
		paddingHorizontal: Spacing.sm,
		paddingVertical: Spacing.xs,
		borderRadius: 16,
	},

	content: {
		paddingHorizontal: Spacing.lg,
	},

	section: {
		marginBottom: Spacing.xl,
	},

	sectionTitle: {
		fontSize: Typography.lg,
		fontWeight: Typography.semibold,
		color: Colors.textPrimary,
		marginBottom: Spacing.md,
	},

	card: {
		backgroundColor: Colors.card,
		borderRadius: 12,
		padding: Spacing.lg,
		...Shadows.sm,
	},

	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderLight,
	},

	infoLabel: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},

	infoLabelText: {
		fontSize: Typography.base,
		color: Colors.textSecondary,
		marginLeft: Spacing.sm,
	},

	infoValue: {
		fontSize: Typography.base,
		color: Colors.textPrimary,
		fontWeight: Typography.medium,
		flex: 1,
		textAlign: "right",
	},

	actionButton: {
		marginBottom: Spacing.sm,
	},

	signOutButton: {
		borderColor: Colors.error,
		marginBottom: 0,
	},

	signOutButtonText: {
		color: Colors.error,
	},
});
