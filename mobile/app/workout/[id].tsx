import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

// Mock data for demonstration
const mockWorkout = {
	id: "1",
	title: "Upper Body Strength",
	description: "Focus on chest, shoulders, and triceps",
	duration_minutes: 45,
	exercises: [
		{
			id: "1",
			name: "Bench Press",
			sets: 3,
			reps: "8-10",
			weight_kg: 60,
			completed_sets: [
				{ set_number: 1, reps: 8, weight_kg: 60, completed: true },
				{ set_number: 2, reps: 8, weight_kg: 60, completed: true },
				{ set_number: 3, reps: 7, weight_kg: 60, completed: false },
			],
		},
		{
			id: "2",
			name: "Overhead Press",
			sets: 3,
			reps: "8-10",
			weight_kg: 40,
			completed_sets: [
				{ set_number: 1, reps: 8, weight_kg: 40, completed: true },
				{ set_number: 2, reps: 8, weight_kg: 40, completed: false },
				{ set_number: 3, reps: 0, weight_kg: 40, completed: false },
			],
		},
		{
			id: "3",
			name: "Dumbbell Rows",
			sets: 3,
			reps: "10-12",
			weight_kg: 25,
			completed_sets: [
				{ set_number: 1, reps: 10, weight_kg: 25, completed: true },
				{ set_number: 2, reps: 0, weight_kg: 25, completed: false },
				{ set_number: 3, reps: 0, weight_kg: 25, completed: false },
			],
		},
		{
			id: "4",
			name: "Tricep Dips",
			sets: 3,
			reps: "8-12",
			weight_kg: 0, // Bodyweight
			completed_sets: [
				{ set_number: 1, reps: 0, weight_kg: 0, completed: false },
				{ set_number: 2, reps: 0, weight_kg: 0, completed: false },
				{ set_number: 3, reps: 0, weight_kg: 0, completed: false },
			],
		},
	],
};

// Mock function to fetch workout details
const fetchWorkoutDetails = async (workoutId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// In a real app, this would fetch from Supabase
	return mockWorkout;
};

// Mock function to update set completion
const updateSetCompletion = async (
	workoutId: string,
	exerciseId: string,
	setNumber: number,
	data: any,
) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	// In a real app, this would update Supabase
	console.log("Updating set:", { workoutId, exerciseId, setNumber, data });
	return { success: true };
};

export default function WorkoutScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [activeExercise, setActiveExercise] = useState<string | null>(null);

	const {
		data: workout,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["workout", id],
		queryFn: () => fetchWorkoutDetails(id),
		enabled: !!id,
	});

	const updateSetMutation = useMutation({
		mutationFn: ({ exerciseId, setNumber, data }: any) =>
			updateSetCompletion(id, exerciseId, setNumber, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workout", id] });
		},
	});

	const handleCompleteWorkout = () => {
		Alert.alert(
			"Complete Workout",
			"Are you sure you want to mark this workout as complete?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Complete",
					style: "default",
					onPress: () => {
						// TODO: Implement workout completion
						Alert.alert("Success", "Workout completed!");
						router.back();
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

		const updatedData = {
			...set,
			[field]: field === "reps" ? parseInt(value) || 0 : parseFloat(value) || 0,
			completed: true,
		};

		updateSetMutation.mutate({ exerciseId, setNumber, data: updatedData });
	};

	const getCompletedSetsCount = (exercise: any) => {
		return exercise.completed_sets.filter((set: any) => set.completed).length;
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
						<Text style={styles.workoutTitle}>{workout.title}</Text>
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
					{workout.exercises.map((exercise, index) => (
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
								<View style={styles.exerciseProgress}>
									<Text style={styles.progressCount}>
										{getCompletedSetsCount(exercise)}/{exercise.sets}
									</Text>
								</View>
							</View>

							{/* Sets */}
							<View style={styles.setsContainer}>
								{exercise.completed_sets.map((set, setIndex) => (
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
});
