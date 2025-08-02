import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { useCreateProgram } from "@/src/hooks/useProgramService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function CreateProgramScreen() {
	const { user } = useAuth();
	const [programName, setProgramName] = useState("");
	const [programDescription, setProgramDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const createProgramMutation = useCreateProgram();

	const handleCreateProgram = async () => {
		if (!programName.trim()) {
			Alert.alert("Error", "Please enter a program name");
			return;
		}

		if (!user?.id) {
			Alert.alert("Error", "User not authenticated");
			return;
		}

		setIsSubmitting(true);

		try {
			await createProgramMutation.mutateAsync({
				name: programName.trim(),
				trainer_id: user.id,
			});

			Alert.alert("Success", "Program created successfully!", [
				{
					text: "OK",
					onPress: () => {
						router.back();
					},
				},
			]);
		} catch (error) {
			console.error("Error creating program:", error);
			Alert.alert("Error", "Failed to create program. Please try again.");
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
					<Text style={styles.title}>Create Program</Text>
					<View style={styles.placeholder} />
				</View>

				{/* Form */}
				<Card style={styles.formCard}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Program Name *</Text>
						<TextInput
							style={styles.input}
							value={programName}
							onChangeText={setProgramName}
							placeholder="Enter program name"
							maxLength={100}
							editable={!isSubmitting}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Description (Optional)</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={programDescription}
							onChangeText={setProgramDescription}
							placeholder="Enter program description"
							maxLength={500}
							multiline
							numberOfLines={4}
							editable={!isSubmitting}
						/>
					</View>

					<Text style={styles.helperText}>
						Choose a clear, descriptive name for your program
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
						title={isSubmitting ? "Creating..." : "Create Program"}
						onPress={handleCreateProgram}
						style={styles.createButton}
						disabled={isSubmitting || !programName.trim()}
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
	inputGroup: {
		marginBottom: 16,
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
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
	helperText: {
		fontSize: 14,
		color: "#64748b",
		marginTop: 8,
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
