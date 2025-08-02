import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import {
	useAddWorkoutToProgram,
	useCreateWorkout,
	useProgramWorkouts,
} from "@/src/hooks/useProgramService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function CreateWorkoutScreen() {
	const { user } = useAuth();
	const { programId } = useLocalSearchParams<{ programId?: string }>();
	const [workoutName, setWorkoutName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createWorkoutMutation = useCreateWorkout();
	const addWorkoutToProgramMutation = useAddWorkoutToProgram();

	// Get existing workouts in the program to calculate order index
	const { data: existingWorkouts = [] } = useProgramWorkouts(programId || "");

	const handleCreateWorkout = async () => {
		if (!workoutName.trim()) {
			Alert.alert("Error", "Please enter a workout name");
			return;
		}

		if (!user?.id) {
			Alert.alert("Error", "User not authenticated");
			return;
		}

		setIsSubmitting(true);

		try {
			// Create the workout first
			const newWorkout = await createWorkoutMutation.mutateAsync({
				name: workoutName.trim(),
				creator_id: user.id,
			});

			// If programId is provided, add workout to the program
			if (programId && newWorkout) {
				const nextOrderIndex = existingWorkouts.length; // Add at the end
				await addWorkoutToProgramMutation.mutateAsync({
					programId,
					workoutId: newWorkout.id,
					orderIndex: nextOrderIndex,
				});
			}

			Alert.alert("Success", "Workout created successfully!", [
				{
					text: "OK",
					onPress: () => {
						// Navigate back to the program if programId exists, otherwise just go back
						if (programId) {
							router.push(`/programs/${programId}`);
						} else {
							router.back();
						}
					},
				},
			]);
		} catch (error) {
			console.error("Error creating workout:", error);
			Alert.alert("Error", "Failed to create workout. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Screen>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Ionicons name="arrow-back" size={24} color="#1e293b" />
					</TouchableOpacity>
					<Text style={styles.title}>
						{programId ? "Add Workout to Program" : "Create Workout"}
					</Text>
					<View style={styles.placeholder} />
				</View>

				{/* Form */}
				<Card style={styles.formCard}>
					{programId && (
						<View style={styles.contextInfo}>
							<Ionicons name="information-circle" size={20} color="#0891b2" />
							<Text style={styles.contextText}>
								This workout will be added to the selected program
							</Text>
						</View>
					)}
					<Text style={styles.label}>Workout Name</Text>
					<TextInput
						style={styles.input}
						value={workoutName}
						onChangeText={setWorkoutName}
						placeholder="Enter workout name"
						maxLength={100}
						editable={!isSubmitting}
					/>
					<Text style={styles.helperText}>
						Choose a clear, descriptive name for your workout
					</Text>
				</Card>

				{/* Action Buttons */}
				<View style={styles.actions}>
					<Button
						title="Cancel"
						variant="outline"
						onPress={() => router.back()}
						style={styles.cancelButton}
						disabled={isSubmitting}
					/>
					<Button
						title={isSubmitting ? "Creating..." : "Create Workout"}
						onPress={handleCreateWorkout}
						style={styles.createButton}
						disabled={isSubmitting || !workoutName.trim()}
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
		justifyContent: "space-between",
		marginBottom: 24,
	},
	backButton: {
		padding: 8,
		marginLeft: -8,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		color: "#1e293b",
	},
	placeholder: {
		width: 40,
	},
	formCard: {
		padding: 20,
		marginBottom: 24,
	},
	contextInfo: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f0f9ff",
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		gap: 8,
	},
	contextText: {
		fontSize: 14,
		color: "#0891b2",
		flex: 1,
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		color: "#1e293b",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#e2e8f0",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#ffffff",
		marginBottom: 8,
	},
	helperText: {
		fontSize: 14,
		color: "#64748b",
	},
	actions: {
		flexDirection: "row",
		gap: 12,
	},
	cancelButton: {
		flex: 1,
	},
	createButton: {
		flex: 1,
	},
});
