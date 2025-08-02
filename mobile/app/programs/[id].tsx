import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Mock data for demonstration
const mockProgramDetails = {
	id: "1",
	title: "Beginner Strength",
	description:
		"A comprehensive 8-week program designed for beginners looking to build strength and muscle. This program focuses on compound movements and progressive overload to help you build a solid foundation.",
	duration_weeks: 8,
	difficulty: "Beginner",
	exercises_count: 24,
	enrolled_trainees: 12,
	created_by: "trainer_1",
	is_enrolled: true,
	progress_percentage: 37.5,
	workouts: [
		{
			id: "1",
			title: "Upper Body Strength",
			description: "Focus on chest, shoulders, and triceps",
			exercises: [
				{ name: "Bench Press", sets: 3, reps: "8-10", weight: "Progressive" },
				{
					name: "Overhead Press",
					sets: 3,
					reps: "8-10",
					weight: "Progressive",
				},
				{
					name: "Dumbbell Rows",
					sets: 3,
					reps: "10-12",
					weight: "Progressive",
				},
				{ name: "Tricep Dips", sets: 3, reps: "8-12", weight: "Bodyweight" },
			],
			duration_minutes: 45,
			completed: true,
		},
		{
			id: "2",
			title: "Lower Body Power",
			description: "Build strength in legs and core",
			exercises: [
				{ name: "Squats", sets: 4, reps: "6-8", weight: "Progressive" },
				{ name: "Deadlifts", sets: 3, reps: "6-8", weight: "Progressive" },
				{ name: "Lunges", sets: 3, reps: "10-12", weight: "Progressive" },
				{ name: "Planks", sets: 3, reps: "30-60s", weight: "Bodyweight" },
			],
			duration_minutes: 50,
			completed: false,
		},
		{
			id: "3",
			title: "Full Body Conditioning",
			description: "High-intensity full body workout",
			exercises: [
				{ name: "Burpees", sets: 3, reps: "10-15", weight: "Bodyweight" },
				{
					name: "Mountain Climbers",
					sets: 3,
					reps: "30s",
					weight: "Bodyweight",
				},
				{ name: "Jump Squats", sets: 3, reps: "12-15", weight: "Bodyweight" },
				{ name: "Push-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
			],
			duration_minutes: 30,
			completed: false,
		},
	],
};

// Mock function to fetch program details
const fetchProgramDetails = async (programId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// In a real app, this would fetch from Supabase
	return mockProgramDetails;
};

export default function ProgramDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { user } = useAuth();
	const [selectedTab, setSelectedTab] = useState<
		"overview" | "workouts" | "progress"
	>("overview");

	const {
		data: program,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["program", id],
		queryFn: () => fetchProgramDetails(id),
		enabled: !!id,
	});

	const isTrainer = user?.user_type === "trainer";
	const isCreator = program?.created_by === user?.id;

	const handleStartWorkout = (workoutId: string) => {
		router.push(`/workout/${workoutId}`);
	};

	const handleEditProgram = () => {
		if (!isTrainer || !isCreator) {
			Alert.alert(
				"Access Denied",
				"Only the program creator can edit this program.",
			);
			return;
		}
		// TODO: Navigate to edit program screen
		Alert.alert("Edit Program", "This will open the program editing screen");
	};

	const handleEnrollProgram = () => {
		// TODO: Implement enrollment logic
		Alert.alert("Enroll", "You have been enrolled in this program!");
	};

	if (isLoading) {
		return (
			<Screen>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading program...</Text>
				</View>
			</Screen>
		);
	}

	if (error || !program) {
		return (
			<Screen>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Failed to load program</Text>
				</View>
			</Screen>
		);
	}

	return (
		<Screen>
			<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Ionicons name="arrow-back" size={24} color="#1e293b" />
					</TouchableOpacity>
					<Text style={styles.title}>{program.title}</Text>
					<TouchableOpacity style={styles.moreButton}>
						<Ionicons name="ellipsis-vertical" size={24} color="#1e293b" />
					</TouchableOpacity>
				</View>

				{/* Program Info Card */}
				<Card style={styles.programInfoCard}>
					<Text style={styles.programDescription}>{program.description}</Text>

					<View style={styles.programStats}>
						<View style={styles.stat}>
							<Ionicons name="time-outline" size={20} color="#0891b2" />
							<Text style={styles.statValue}>
								{program.duration_weeks} weeks
							</Text>
						</View>
						<View style={styles.stat}>
							<Ionicons name="fitness-outline" size={20} color="#0891b2" />
							<Text style={styles.statValue}>
								{program.exercises_count} exercises
							</Text>
						</View>
						<View style={styles.stat}>
							<Ionicons name="people-outline" size={20} color="#0891b2" />
							<Text style={styles.statValue}>
								{program.enrolled_trainees} trainees
							</Text>
						</View>
					</View>

					{program.is_enrolled && (
						<View style={styles.progressSection}>
							<View style={styles.progressHeader}>
								<Text style={styles.progressLabel}>Your Progress</Text>
								<Text style={styles.progressPercentage}>
									{program.progress_percentage}%
								</Text>
							</View>
							<View style={styles.progressBar}>
								<View
									style={[
										styles.progressFill,
										{ width: `${program.progress_percentage}%` },
									]}
								/>
							</View>
						</View>
					)}
				</Card>

				{/* Action Buttons */}
				<View style={styles.actionButtons}>
					{isTrainer && isCreator ? (
						<Button title="Edit Program" onPress={handleEditProgram} />
					) : !program.is_enrolled ? (
						<Button title="Enroll in Program" onPress={handleEnrollProgram} />
					) : (
						<Button
							title="Continue Program"
							onPress={() => setSelectedTab("workouts")}
						/>
					)}
				</View>

				{/* Tab Navigation */}
				<View style={styles.tabContainer}>
					<TouchableOpacity
						style={[styles.tab, selectedTab === "overview" && styles.activeTab]}
						onPress={() => setSelectedTab("overview")}
					>
						<Text
							style={[
								styles.tabText,
								selectedTab === "overview" && styles.activeTabText,
							]}
						>
							Overview
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.tab, selectedTab === "workouts" && styles.activeTab]}
						onPress={() => setSelectedTab("workouts")}
					>
						<Text
							style={[
								styles.tabText,
								selectedTab === "workouts" && styles.activeTabText,
							]}
						>
							Workouts
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.tab, selectedTab === "progress" && styles.activeTab]}
						onPress={() => setSelectedTab("progress")}
					>
						<Text
							style={[
								styles.tabText,
								selectedTab === "progress" && styles.activeTabText,
							]}
						>
							Progress
						</Text>
					</TouchableOpacity>
				</View>

				{/* Tab Content */}
				{selectedTab === "overview" && (
					<View style={styles.tabContent}>
						<Card style={styles.section}>
							<Text style={styles.sectionTitle}>Program Overview</Text>
							<View style={styles.overviewItem}>
								<Ionicons name="calendar-outline" size={20} color="#64748b" />
								<Text style={styles.overviewText}>
									Duration: {program.duration_weeks} weeks
								</Text>
							</View>
							<View style={styles.overviewItem}>
								<Ionicons
									name="trending-up-outline"
									size={20}
									color="#64748b"
								/>
								<Text style={styles.overviewText}>
									Difficulty: {program.difficulty}
								</Text>
							</View>
							<View style={styles.overviewItem}>
								<Ionicons name="fitness-outline" size={20} color="#64748b" />
								<Text style={styles.overviewText}>
									Total Workouts: {program.workouts.length}
								</Text>
							</View>
						</Card>
					</View>
				)}

				{selectedTab === "workouts" && (
					<View style={styles.tabContent}>
						{program.workouts.map((workout, index) => (
							<Card key={workout.id} style={styles.workoutCard}>
								<View style={styles.workoutHeader}>
									<View style={styles.workoutInfo}>
										<Text style={styles.workoutTitle}>{workout.title}</Text>
										<Text style={styles.workoutDescription}>
											{workout.description}
										</Text>
										<Text style={styles.workoutDuration}>
											{workout.duration_minutes} minutes
										</Text>
									</View>
									{workout.completed && (
										<View style={styles.completedBadge}>
											<Ionicons
												name="checkmark-circle"
												size={24}
												color="#10b981"
											/>
										</View>
									)}
								</View>

								<View style={styles.exercisesList}>
									{workout.exercises
										.slice(0, 3)
										.map((exercise, exerciseIndex) => (
											<Text key={exerciseIndex} style={styles.exerciseItem}>
												• {exercise.name} ({exercise.sets} sets, {exercise.reps}
												)
											</Text>
										))}
									{workout.exercises.length > 3 && (
										<Text style={styles.moreExercises}>
											+{workout.exercises.length - 3} more exercises
										</Text>
									)}
								</View>

								<TouchableOpacity
									style={styles.startWorkoutButton}
									onPress={() => handleStartWorkout(workout.id)}
								>
									<Text style={styles.startWorkoutText}>
										{workout.completed ? "Repeat Workout" : "Start Workout"}
									</Text>
									<Ionicons name="play" size={16} color="#ffffff" />
								</TouchableOpacity>
							</Card>
						))}
					</View>
				)}

				{selectedTab === "progress" && (
					<View style={styles.tabContent}>
						<Card style={styles.section}>
							<Text style={styles.sectionTitle}>Progress Tracking</Text>
							<Text style={styles.progressText}>
								Track your progress through this program. Complete workouts to
								see your advancement.
							</Text>
							{/* TODO: Add progress charts and metrics */}
						</Card>
					</View>
				)}
			</ScrollView>
		</Screen>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 16,
		color: "#64748b",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorText: {
		fontSize: 16,
		color: "#ef4444",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	backButton: {
		padding: 4,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		color: "#1e293b",
		flex: 1,
		textAlign: "center",
	},
	moreButton: {
		padding: 4,
	},
	programInfoCard: {
		padding: 16,
		marginBottom: 16,
	},
	programDescription: {
		fontSize: 16,
		color: "#1e293b",
		lineHeight: 24,
		marginBottom: 16,
	},
	programStats: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 16,
	},
	stat: {
		alignItems: "center",
	},
	statValue: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1e293b",
		marginTop: 4,
	},
	progressSection: {
		marginTop: 8,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	progressLabel: {
		fontSize: 14,
		color: "#64748b",
	},
	progressPercentage: {
		fontSize: 14,
		fontWeight: "600",
		color: "#0891b2",
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
	actionButtons: {
		marginBottom: 16,
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "#f1f5f9",
		borderRadius: 8,
		padding: 4,
		marginBottom: 16,
	},
	tab: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 6,
		alignItems: "center",
	},
	activeTab: {
		backgroundColor: "#ffffff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	tabText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#64748b",
	},
	activeTabText: {
		color: "#0891b2",
	},
	tabContent: {
		gap: 16,
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
	overviewItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	overviewText: {
		fontSize: 14,
		color: "#1e293b",
		marginLeft: 12,
	},
	workoutCard: {
		padding: 16,
	},
	workoutHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	workoutInfo: {
		flex: 1,
	},
	workoutTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
		marginBottom: 4,
	},
	workoutDescription: {
		fontSize: 14,
		color: "#64748b",
		marginBottom: 4,
	},
	workoutDuration: {
		fontSize: 12,
		color: "#64748b",
	},
	completedBadge: {
		marginLeft: 8,
	},
	exercisesList: {
		marginBottom: 12,
	},
	exerciseItem: {
		fontSize: 14,
		color: "#64748b",
		marginBottom: 4,
	},
	moreExercises: {
		fontSize: 12,
		color: "#0891b2",
		fontStyle: "italic",
	},
	startWorkoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#0891b2",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
	},
	startWorkoutText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#ffffff",
		marginRight: 8,
	},
	progressText: {
		fontSize: 14,
		color: "#64748b",
		lineHeight: 20,
	},
});
