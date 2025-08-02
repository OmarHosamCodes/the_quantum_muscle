import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { useWorkout } from "@/src/hooks/useWorkout";
import type {
	CompletedSet,
	UpdateSetData,
	WorkoutExercise,
} from "@/src/lib/workoutService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function WorkoutScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { user } = useAuth();

	const {
		workout,
		isLoading,
		error,
		updateSet,
		completeWorkout: completeWorkoutMutation,
		removeExercise,
	} = useWorkout(id);

	const handleCompleteWorkout = () => {
		Alert.alert(
			"Complete Workout",
			"Are you sure you want to mark this workout as complete?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Complete",
					style: "default",
					onPress: async () => {
						try {
							if (user?.id) {
								completeWorkoutMutation({ userId: user.id });
								Alert.alert("Success", "Workout completed!");
								router.back();
							}
						} catch (err) {
							console.error("Failed to complete workout:", err);
							Alert.alert("Error", "Failed to complete workout");
						}
					},
				},
			],
		);
	};

	const handleSetInput = (
		exerciseId: string,
		setNumber: number,
		field: "reps" | "weight_kg",
		value: string,
	) => {
		const exercise = workout?.exercises.find((ex) => ex.id === exerciseId);
		if (!exercise) return;

		const set = exercise.completed_sets.find((s) => s.set_number === setNumber);
		if (!set) return;

		const updatedData: UpdateSetData = {
			reps: field === "reps" ? parseInt(value) || 0 : set.reps,
			weight_kg: field === "weight_kg" ? parseFloat(value) || 0 : set.weight_kg,
			completed: true,
		};

		updateSet({ exerciseId, setNumber, data: updatedData });
	};

	const handleDeleteExercise = (exerciseId: string, exerciseName: string) => {
		Alert.alert(
			"Delete Exercise",
			`Are you sure you want to delete "${exerciseName}"? This will remove all sets and data for this exercise.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						removeExercise(exerciseId);
					},
				},
			],
		);
	};

	const getCompletedSetsCount = (exercise: WorkoutExercise) => {
		return exercise.completed_sets.filter((set: CompletedSet) => set.completed)
			.length;
	};

	const getTotalCompletedSets = () => {
		if (!workout) return 0;
		return workout.exercises.reduce((total, exercise) => {
			return total + getCompletedSetsCount(exercise);
		}, 0);
	};

	const getTotalSets = () => {
		if (!workout) return 0;
		return workout.exercises.reduce((total, exercise) => {
			return total + exercise.sets;
		}, 0);
	};

	if (isLoading) {
		return (
			<Screen>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading workout...</Text>
				</View>
			</Screen>
		);
	}

	if (error || !workout) {
		return (
			<Screen>
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>Failed to load workout</Text>
				</View>
			</Screen>
		);
	}

	return (
		<Screen>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Ionicons name="arrow-back" size={24} color="#1e293b" />
					</TouchableOpacity>
					<View style={styles.headerInfo}>
						<Text style={styles.workoutTitle}>{workout.name}</Text>
						<Text style={styles.workoutSubtitle}>{workout.description}</Text>
					</View>
					<TouchableOpacity style={styles.moreButton}>
						<Ionicons name="ellipsis-vertical" size={24} color="#1e293b" />
					</TouchableOpacity>
				</View>

				{/* Progress Bar */}
				<Card style={styles.progressCard}>
					<View style={styles.progressHeader}>
						<Text style={styles.progressTitle}>Workout Progress</Text>
						<Text style={styles.progressText}>
							{getTotalCompletedSets()}/{getTotalSets()} sets completed
						</Text>
					</View>
					<View style={styles.progressBar}>
						<View
							style={[
								styles.progressFill,
								{
									width: `${(getTotalCompletedSets() / getTotalSets()) * 100}%`,
								},
							]}
						/>
					</View>
				</Card>

				{/* Exercises */}
				<ScrollView
					style={styles.exercisesContainer}
					showsVerticalScrollIndicator={false}
				>
					{workout.exercises.map((exercise) => (
						<Card key={exercise.id} style={styles.exerciseCard}>
							<View style={styles.exerciseHeader}>
								<View style={styles.exerciseInfo}>
									<Text style={styles.exerciseName}>{exercise.name}</Text>
									<Text style={styles.exerciseDetails}>
										{exercise.sets} sets • {exercise.reps} reps
										{exercise.weight_kg > 0
											? ` • ${exercise.weight_kg}kg`
											: " • Bodyweight"}
									</Text>
								</View>
								<View style={styles.exerciseActions}>
									<View style={styles.exerciseProgress}>
										<Text style={styles.progressCount}>
											{getCompletedSetsCount(exercise)}/{exercise.sets}
										</Text>
									</View>
									<TouchableOpacity
										style={styles.deleteButton}
										onPress={() =>
											handleDeleteExercise(exercise.id, exercise.name)
										}
									>
										<Ionicons name="trash-outline" size={18} color="#ef4444" />
									</TouchableOpacity>
								</View>
							</View>

							{/* Sets */}
							<View style={styles.setsContainer}>
								{exercise.completed_sets.map((set) => (
									<View key={set.set_number} style={styles.setRow}>
										<View style={styles.setHeader}>
											<Text style={styles.setNumber}>Set {set.set_number}</Text>
											{set.completed && (
												<Ionicons
													name="checkmark-circle"
													size={16}
													color="#10b981"
												/>
											)}
										</View>

										<View style={styles.setInputs}>
											<View style={styles.inputGroup}>
												<Text style={styles.inputLabel}>Reps</Text>
												<TextInput
													style={[
														styles.input,
														set.completed && styles.completedInput,
													]}
													value={set.reps.toString()}
													onChangeText={(value) =>
														handleSetInput(
															exercise.id,
															set.set_number,
															"reps",
															value,
														)
													}
													keyboardType="numeric"
													placeholder="0"
												/>
											</View>

											{exercise.weight_kg > 0 && (
												<View style={styles.inputGroup}>
													<Text style={styles.inputLabel}>Weight (kg)</Text>
													<TextInput
														style={[
															styles.input,
															set.completed && styles.completedInput,
														]}
														value={set.weight_kg.toString()}
														onChangeText={(value) =>
															handleSetInput(
																exercise.id,
																set.set_number,
																"weight_kg",
																value,
															)
														}
														keyboardType="numeric"
														placeholder="0"
													/>
												</View>
											)}
										</View>
									</View>
								))}
							</View>
						</Card>
					))}

					{/* Add Exercise Button */}
					<Card style={styles.addExerciseCard}>
						<TouchableOpacity
							style={styles.addExerciseButton}
							onPress={() => router.push(`/create-exercise?workoutId=${id}`)}
						>
							<View style={styles.addExerciseContent}>
								<View style={styles.addExerciseIcon}>
									<Ionicons name="add" size={24} color="#0891b2" />
								</View>
								<View style={styles.addExerciseText}>
									<Text style={styles.addExerciseTitle}>Add Exercise</Text>
									<Text style={styles.addExerciseSubtitle}>
										Add a new exercise to this workout
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={20} color="#94a3b8" />
							</View>
						</TouchableOpacity>
					</Card>
				</ScrollView>

				{/* Complete Workout Button */}
				<View style={styles.completeButtonContainer}>
					<Button
						title="Complete Workout"
						onPress={handleCompleteWorkout}
						disabled={getTotalCompletedSets() === 0}
					/>
				</View>
			</View>
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
		alignItems: "center",
		marginBottom: 16,
	},
	backButton: {
		padding: 4,
		marginRight: 12,
	},
	headerInfo: {
		flex: 1,
	},
	workoutTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1e293b",
	},
	workoutSubtitle: {
		fontSize: 14,
		color: "#64748b",
		marginTop: 2,
	},
	moreButton: {
		padding: 4,
	},
	progressCard: {
		padding: 16,
		marginBottom: 16,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	progressTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
	},
	progressText: {
		fontSize: 14,
		color: "#64748b",
	},
	progressBar: {
		height: 8,
		backgroundColor: "#e2e8f0",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#0891b2",
	},
	exercisesContainer: {
		flex: 1,
	},
	exerciseCard: {
		marginBottom: 16,
		padding: 16,
	},
	exerciseHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	exerciseInfo: {
		flex: 1,
	},
	exerciseName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
		marginBottom: 4,
	},
	exerciseDetails: {
		fontSize: 14,
		color: "#64748b",
	},
	exerciseProgress: {
		alignItems: "center",
	},
	exerciseActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	deleteButton: {
		padding: 4,
	},
	progressCount: {
		fontSize: 14,
		fontWeight: "600",
		color: "#0891b2",
	},
	setsContainer: {
		gap: 12,
	},
	setRow: {
		backgroundColor: "#f8fafc",
		borderRadius: 8,
		padding: 12,
	},
	setHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	setNumber: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1e293b",
	},
	setInputs: {
		flexDirection: "row",
		gap: 12,
	},
	inputGroup: {
		flex: 1,
	},
	inputLabel: {
		fontSize: 12,
		color: "#64748b",
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: "#e2e8f0",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 14,
		color: "#1e293b",
		backgroundColor: "#ffffff",
	},
	completedInput: {
		borderColor: "#10b981",
		backgroundColor: "#f0fdf4",
	},
	completeButtonContainer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#e2e8f0",
		backgroundColor: "#ffffff",
	},
	addExerciseCard: {
		marginBottom: 16,
		padding: 0,
		overflow: "hidden",
	},
	addExerciseButton: {
		padding: 16,
	},
	addExerciseContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	addExerciseIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#f0f9ff",
		justifyContent: "center",
		alignItems: "center",
	},
	addExerciseText: {
		flex: 1,
	},
	addExerciseTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
		marginBottom: 2,
	},
	addExerciseSubtitle: {
		fontSize: 14,
		color: "#64748b",
	},
});
