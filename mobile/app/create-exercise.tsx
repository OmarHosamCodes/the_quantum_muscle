import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Screen } from "@/src/components/ui/Screen";
import { workoutService } from "@/src/lib/workoutService";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Common muscle groups for quick selection
const MUSCLE_GROUPS = [
	"Chest",
	"Back",
	"Shoulders",
	"Arms",
	"Legs",
	"Core",
	"Glutes",
	"Cardio",
];

export default function CreateExerciseScreen() {
	const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
	const queryClient = useQueryClient();

	const [exerciseName, setExerciseName] = useState("");
	const [targetMuscle, setTargetMuscle] = useState("");
	const [contentUrl, setContentUrl] = useState("");

	const createExerciseMutation = useMutation({
		mutationFn: (exerciseData: {
			name: string;
			target_muscle: string;
			workout_id: string;
			content_url?: string;
		}) => workoutService.addExerciseToWorkout(exerciseData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
			Alert.alert("Success", "Exercise added to workout!", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		},
		onError: (error) => {
			Alert.alert("Error", `Failed to add exercise: ${error.message}`);
		},
	});

	const handleCreateExercise = () => {
		if (!exerciseName.trim()) {
			Alert.alert("Error", "Please enter an exercise name");
			return;
		}

		if (!targetMuscle.trim()) {
			Alert.alert("Error", "Please select a target muscle group");
			return;
		}

		if (!workoutId) {
			Alert.alert("Error", "Invalid workout ID");
			return;
		}

		createExerciseMutation.mutate({
			name: exerciseName.trim(),
			target_muscle: targetMuscle,
			workout_id: workoutId,
			content_url: contentUrl.trim() || undefined,
		});
	};

	const selectMuscleGroup = (muscle: string) => {
		setTargetMuscle(muscle);
	};

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
						<Text style={styles.title}>Add Exercise</Text>
						<Text style={styles.subtitle}>
							Create a new exercise for this workout
						</Text>
					</View>
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{/* Exercise Name */}
					<Card style={styles.card}>
						<Text style={styles.sectionTitle}>Exercise Name</Text>
						<Input
							placeholder="e.g., Bench Press, Squats, Push-ups"
							value={exerciseName}
							onChangeText={setExerciseName}
							inputStyle={styles.input}
						/>
					</Card>

					{/* Target Muscle Group */}
					<Card style={styles.card}>
						<Text style={styles.sectionTitle}>Target Muscle Group</Text>
						<View style={styles.muscleGrid}>
							{MUSCLE_GROUPS.map((muscle) => (
								<TouchableOpacity
									key={muscle}
									style={[
										styles.muscleButton,
										targetMuscle === muscle && styles.muscleButtonSelected,
									]}
									onPress={() => selectMuscleGroup(muscle)}
								>
									<Text
										style={[
											styles.muscleButtonText,
											targetMuscle === muscle &&
												styles.muscleButtonTextSelected,
										]}
									>
										{muscle}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						{/* Custom muscle input */}
						<View style={styles.customMuscleContainer}>
							<Text style={styles.orText}>or enter custom:</Text>
							<Input
								placeholder="Enter custom muscle group"
								value={targetMuscle}
								onChangeText={setTargetMuscle}
								inputStyle={styles.input}
							/>
						</View>
					</Card>

					{/* Content URL (Optional) */}
					<Card style={styles.card}>
						<Text style={styles.sectionTitle}>
							Reference Content (Optional)
						</Text>
						<Text style={styles.sectionDescription}>
							Add a link to a video or image demonstrating the exercise
						</Text>
						<Input
							placeholder="https://example.com/exercise-demo"
							value={contentUrl}
							onChangeText={setContentUrl}
							inputStyle={styles.input}
							keyboardType="url"
						/>
					</Card>

					{/* Exercise Tips */}
					<Card style={styles.card}>
						<View style={styles.tipContainer}>
							<Ionicons name="bulb-outline" size={20} color="#0891b2" />
							<View style={styles.tipContent}>
								<Text style={styles.tipTitle}>Pro Tips</Text>
								<Text style={styles.tipText}>
									• Use clear, descriptive names for your exercises{"\n"}•
									Select the primary muscle group being targeted{"\n"}• Add
									reference content to help with proper form{"\n"}• You can
									always edit or remove exercises later
								</Text>
							</View>
						</View>
					</Card>
				</ScrollView>

				{/* Create Button */}
				<View style={styles.buttonContainer}>
					<Button
						title={
							createExerciseMutation.isPending
								? "Adding Exercise..."
								: "Add Exercise"
						}
						onPress={handleCreateExercise}
						disabled={
							createExerciseMutation.isPending ||
							!exerciseName.trim() ||
							!targetMuscle.trim()
						}
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
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1e293b",
	},
	subtitle: {
		fontSize: 14,
		color: "#64748b",
		marginTop: 2,
	},
	content: {
		flex: 1,
	},
	card: {
		padding: 16,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1e293b",
		marginBottom: 8,
	},
	sectionDescription: {
		fontSize: 14,
		color: "#64748b",
		marginBottom: 12,
	},
	input: {
		marginBottom: 8,
	},
	muscleGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 16,
	},
	muscleButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: "#f1f5f9",
		borderWidth: 1,
		borderColor: "#e2e8f0",
	},
	muscleButtonSelected: {
		backgroundColor: "#0891b2",
		borderColor: "#0891b2",
	},
	muscleButtonText: {
		fontSize: 14,
		color: "#64748b",
		fontWeight: "500",
	},
	muscleButtonTextSelected: {
		color: "#ffffff",
	},
	customMuscleContainer: {
		marginTop: 8,
	},
	orText: {
		fontSize: 14,
		color: "#64748b",
		marginBottom: 8,
		textAlign: "center",
	},
	tipContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
	},
	tipContent: {
		flex: 1,
	},
	tipTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#0891b2",
		marginBottom: 4,
	},
	tipText: {
		fontSize: 13,
		color: "#64748b",
		lineHeight: 18,
	},
	buttonContainer: {
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: "#e2e8f0",
		backgroundColor: "#ffffff",
	},
});
