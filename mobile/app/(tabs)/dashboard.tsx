import { Avatar } from "@/src/components/ui/Avatar";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { useMyClients } from "@/src/hooks/useMyClients";
import { useMyProgram } from "@/src/hooks/useMyProgram";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function DashboardScreen() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	const isTrainer = user.user_type === "trainer";

	return (
		<Screen>
			<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.greeting}>Welcome back,</Text>
						<Text style={styles.name}>{user.name}</Text>
					</View>
					<Avatar
						size={50}
						source={user.avatar_url ? { uri: user.avatar_url } : undefined}
						fallback={user.name?.charAt(0) || "U"}
					/>
				</View>

				{isTrainer ? <TrainerDashboard /> : <TraineeDashboard />}
			</ScrollView>
		</Screen>
	);
}

function TrainerDashboard() {
	const { user } = useAuth();
	const { data: clients, isLoading: clientsLoading } = useMyClients(user?.id);

	return (
		<View style={styles.content}>
			{/* Stats Cards */}
			<View style={styles.statsRow}>
				<Card style={styles.statCard}>
					<View style={styles.statContent}>
						<Ionicons name="people" size={24} color="#0891b2" />
						<Text style={styles.statNumber}>{clients?.length || 0}</Text>
						<Text style={styles.statLabel}>Active Clients</Text>
					</View>
				</Card>
				<Card style={styles.statCard}>
					<View style={styles.statContent}>
						<Ionicons name="fitness" size={24} color="#0891b2" />
						<Text style={styles.statNumber}>8</Text>
						<Text style={styles.statLabel}>Programs</Text>
					</View>
				</Card>
			</View>

			{/* Recent Activity */}
			<Card style={styles.section}>
				<Text style={styles.sectionTitle}>Recent Activity</Text>
				{clients?.slice(0, 2).map((client, index) => (
					<View key={client.id} style={styles.activityItem}>
						<Avatar size={32} fallback={client.name.charAt(0)} />
						<View style={styles.activityContent}>
							<Text style={styles.activityText}>
								<Text style={styles.bold}>{client.name}</Text> completed{" "}
								{client.last_workout?.title}
							</Text>
							<Text style={styles.activityTime}>
								{new Date(
									client.last_workout?.completed_at || "",
								).toLocaleDateString()}
							</Text>
						</View>
					</View>
				))}
			</Card>

			{/* Quick Actions */}
			<Card style={styles.section}>
				<Text style={styles.sectionTitle}>Quick Actions</Text>
				<View style={styles.actionButtons}>
					<View style={styles.actionButton}>
						<Ionicons name="add-circle" size={24} color="#0891b2" />
						<Text style={styles.actionText}>Create Program</Text>
					</View>
					<View style={styles.actionButton}>
						<Ionicons name="chatbubbles" size={24} color="#0891b2" />
						<Text style={styles.actionText}>Message Clients</Text>
					</View>
				</View>
			</Card>
		</View>
	);
}

function TraineeDashboard() {
	const { user } = useAuth();
	const { data: program, isLoading: programLoading } = useMyProgram(user?.id);

	return (
		<View style={styles.content}>
			{/* Today's Workout */}
			<Card style={styles.section}>
				<Text style={styles.sectionTitle}>Today's Workout</Text>
				<View style={styles.workoutCard}>
					<View style={styles.workoutHeader}>
						<Ionicons name="fitness" size={24} color="#0891b2" />
						<Text style={styles.workoutTitle}>
							{program?.next_workout?.title || "No workout scheduled"}
						</Text>
					</View>
					<Text style={styles.workoutSubtitle}>
						{program?.next_workout
							? `${program.next_workout.exercises_count} exercises • ${program.next_workout.estimated_duration} min`
							: "Take a rest day"}
					</Text>
					{program?.next_workout && (
						<View style={styles.workoutProgress}>
							<View style={styles.progressBar}>
								<View style={[styles.progressFill, { width: "0%" }]} />
							</View>
							<Text style={styles.progressText}>Ready to start</Text>
						</View>
					)}
				</View>
			</Card>

			{/* Progress Stats */}
			<View style={styles.statsRow}>
				<Card style={styles.statCard}>
					<View style={styles.statContent}>
						<Ionicons name="trending-up" size={24} color="#0891b2" />
						<Text style={styles.statNumber}>
							{program?.progress_percentage || 0}%
						</Text>
						<Text style={styles.statLabel}>Completion</Text>
					</View>
				</Card>
				<Card style={styles.statCard}>
					<View style={styles.statContent}>
						<Ionicons name="calendar" size={24} color="#0891b2" />
						<Text style={styles.statNumber}>12</Text>
						<Text style={styles.statLabel}>Days Streak</Text>
					</View>
				</Card>
			</View>

			{/* Current Program */}
			<Card style={styles.section}>
				<Text style={styles.sectionTitle}>Current Program</Text>
				<View style={styles.programCard}>
					<Text style={styles.programTitle}>
						{program?.title || "No program assigned"}
					</Text>
					<Text style={styles.programSubtitle}>
						{program
							? `Week ${program.current_week} of ${program.total_weeks}`
							: "Contact your trainer"}
					</Text>
					{program && (
						<View style={styles.programProgress}>
							<View style={styles.progressBar}>
								<View
									style={[
										styles.progressFill,
										{ width: `${program.progress_percentage}%` },
									]}
								/>
							</View>
							<Text style={styles.progressText}>
								{program.progress_percentage}% completed
							</Text>
						</View>
					)}
				</View>
			</Card>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	greeting: {
		fontSize: 16,
		color: "#64748b",
	},
	name: {
		fontSize: 24,
		fontWeight: "600",
		color: "#1e293b",
	},
	content: {
		gap: 16,
	},
	statsRow: {
		flexDirection: "row",
		gap: 12,
	},
	statCard: {
		flex: 1,
	},
	statContent: {
		alignItems: "center",
		padding: 16,
	},
	statNumber: {
		fontSize: 24,
		fontWeight: "700",
		color: "#1e293b",
		marginTop: 8,
	},
	statLabel: {
		fontSize: 14,
		color: "#64748b",
		marginTop: 4,
	},
	section: {
		padding: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1e293b",
		marginBottom: 16,
	},
	activityItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
	},
	activityContent: {
		marginLeft: 12,
		flex: 1,
	},
	activityText: {
		fontSize: 14,
		color: "#1e293b",
	},
	activityTime: {
		fontSize: 12,
		color: "#64748b",
		marginTop: 2,
	},
	bold: {
		fontWeight: "600",
	},
	actionButtons: {
		flexDirection: "row",
		gap: 12,
	},
	actionButton: {
		flex: 1,
		alignItems: "center",
		padding: 16,
		backgroundColor: "#f1f5f9",
		borderRadius: 8,
	},
	actionText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#1e293b",
		marginTop: 8,
	},
	workoutCard: {
		padding: 16,
		backgroundColor: "#f8fafc",
		borderRadius: 8,
	},
	workoutHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	workoutTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
		marginLeft: 8,
	},
	workoutSubtitle: {
		fontSize: 14,
		color: "#64748b",
		marginBottom: 12,
	},
	workoutProgress: {
		marginTop: 8,
	},
	progressBar: {
		height: 6,
		backgroundColor: "#e2e8f0",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#0891b2",
	},
	progressText: {
		fontSize: 12,
		color: "#64748b",
		marginTop: 4,
	},
	programCard: {
		padding: 16,
		backgroundColor: "#f8fafc",
		borderRadius: 8,
	},
	programTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
	},
	programSubtitle: {
		fontSize: 14,
		color: "#64748b",
		marginTop: 4,
		marginBottom: 12,
	},
	programProgress: {
		marginTop: 8,
	},
});
