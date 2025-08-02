import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useProgram, useProgramWorkouts } from "@/src/hooks/useProgramService";
import type { Exercise } from "@/src/lib/programService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ProgramDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	// Fetch program data
	const {
		data: program,
		isLoading: isProgramLoading,
		error: programError,
	} = useProgram(id || "");

	// Fetch program workouts
	const { data: programWorkouts = [], isLoading: isWorkoutsLoading } =
		useProgramWorkouts(id || "");

	const isLoading = isProgramLoading || isWorkoutsLoading;

	const handleWorkoutPress = (workoutId: string) => {
		router.push(`/workout/${workoutId}`);
	};

	// Helper function to get total sets for an exercise
	const getExerciseSetsInfo = (exercise: Exercise) => {
		const totalSets = exercise.exercise_sets.length;
		const repsInfo = exercise.exercise_sets[0]?.reps || "varies";
		return `${totalSets} sets${repsInfo !== "varies" ? `, ${repsInfo} reps` : ""}`;
	};

	if (isLoading) {
		return (
			<Screen>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#0891b2" />
					<Text style={styles.loadingText}>Loading program...</Text>
				</View>
			</Screen>
		);
	}

	if (programError || !program) {
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
					<Text style={styles.title}>{program.name}</Text>
					<TouchableOpacity style={styles.moreButton}>
						<Ionicons name="ellipsis-vertical" size={24} color="#1e293b" />
					</TouchableOpacity>
				</View>

				{/* Add Workout Button */}
				<TouchableOpacity
					style={styles.addWorkoutButton}
					onPress={() => router.push(`/create-workout?programId=${id}`)}
					activeOpacity={0.7}
				>
					<View style={styles.addWorkoutContent}>
						<Ionicons name="add-circle" size={24} color="#0891b2" />
						<Text style={styles.addWorkoutText}>Add Workout</Text>
					</View>
				</TouchableOpacity>

				{/* Workouts List */}
				<View style={styles.workoutsContainer}>
					{programWorkouts
						.sort((a, b) => a.order_index - b.order_index)
						.map((workout) => (
							<TouchableOpacity
								key={workout.id}
								onPress={() => handleWorkoutPress(workout.id)}
								activeOpacity={0.7}
							>
								<Card style={styles.workoutCard}>
									<View style={styles.workoutHeader}>
										<View style={styles.workoutInfo}>
											<Text style={styles.workoutTitle}>{workout.name}</Text>
											<Text style={styles.workoutStats}>
												{workout.exercises.length} exercises
											</Text>
											{workout.created_at && (
												<Text style={styles.workoutDate}>
													Created:{" "}
													{new Date(workout.created_at).toLocaleDateString()}
												</Text>
											)}
										</View>
										{workout.image_url && (
											<View style={styles.workoutImagePlaceholder}>
												<Ionicons
													name="image-outline"
													size={24}
													color="#64748b"
												/>
											</View>
										)}
									</View>

									<View style={styles.exercisesList}>
										{workout.exercises.slice(0, 3).map((exercise) => (
											<View key={exercise.id} style={styles.exerciseItem}>
												<Text style={styles.exerciseName}>
													• {exercise.name}
												</Text>
												<Text style={styles.exerciseDetails}>
													{getExerciseSetsInfo(exercise)} •{" "}
													{exercise.target_muscle}
												</Text>
											</View>
										))}
										{workout.exercises.length > 3 && (
											<Text style={styles.moreExercises}>
												+{workout.exercises.length - 3} more exercises
											</Text>
										)}
									</View>

									<View style={styles.workoutFooter}>
										<Ionicons
											name="chevron-forward"
											size={20}
											color="#64748b"
										/>
									</View>
								</Card>
							</TouchableOpacity>
						))}
				</View>
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
		marginBottom: 24,
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
	addWorkoutButton: {
		backgroundColor: "#f0f9ff",
		borderWidth: 2,
		borderColor: "#0891b2",
		borderStyle: "dashed",
		borderRadius: 12,
		padding: 16,
		marginBottom: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	addWorkoutContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	addWorkoutText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#0891b2",
	},
	workoutsContainer: {
		gap: 16,
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
	workoutStats: {
		fontSize: 14,
		color: "#64748b",
		marginBottom: 2,
	},
	workoutDate: {
		fontSize: 12,
		color: "#64748b",
	},
	workoutImagePlaceholder: {
		width: 40,
		height: 40,
		backgroundColor: "#f1f5f9",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		marginLeft: 12,
	},
	exercisesList: {
		marginBottom: 12,
	},
	exerciseItem: {
		marginBottom: 6,
	},
	exerciseName: {
		fontSize: 14,
		color: "#1e293b",
		fontWeight: "500",
	},
	exerciseDetails: {
		fontSize: 12,
		color: "#64748b",
		marginTop: 2,
	},
	moreExercises: {
		fontSize: 12,
		color: "#0891b2",
		fontStyle: "italic",
		marginTop: 4,
	},
	workoutFooter: {
		alignItems: "flex-end",
	},
});
