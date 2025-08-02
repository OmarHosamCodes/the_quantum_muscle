import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { useTrainerPrograms } from "@/src/hooks/useProgramService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type FilterType = "all" | "enrolled" | "available";

interface Program {
	id: string;
	name: string;
	description?: string | null;
	created_at: string | null;
	trainer_id: string | null;
}

export default function ProgramsScreen() {
	const { user } = useAuth();
	const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

	const isTrainer = user?.user_type === "trainer";

	// Fetch trainer's programs if user is a trainer
	const {
		data: trainerPrograms = [],
		isLoading: isLoadingTrainerPrograms,
		refetch: refetchTrainerPrograms,
	} = useTrainerPrograms(user?.id || "");

	// TODO: Add hooks for trainee programs when implemented
	// const { data: traineePrograms = [], isLoading: isLoadingTraineePrograms } = useTraineePrograms(user?.id || "");

	const isLoading = isTrainer ? isLoadingTrainerPrograms : false;
	const programs = isTrainer ? trainerPrograms : [];

	const filteredPrograms = programs.filter((_program) => {
		// TODO: Implement filtering logic based on enrollment status when trainee programs are available
		if (selectedFilter === "enrolled") return false; // program.is_enrolled;
		if (selectedFilter === "available") return true; // !program.is_enrolled;
		return true;
	});

	const handleCreateProgram = () => {
		router.push("/create-program");
	};

	const handleProgramPress = (programId: string) => {
		router.push(`/programs/${programId}`);
	};

	const renderProgram = ({ item }: { item: Program }) => (
		<TouchableOpacity onPress={() => handleProgramPress(item.id)}>
			<Card style={styles.programCard}>
				<View style={styles.programHeader}>
					<View style={styles.programInfo}>
						<Text style={styles.programTitle}>{item.name}</Text>
						<Text style={styles.programDescription}>
							{item.description || "No description available"}
						</Text>
					</View>
					{/* TODO: Add enrollment badge when trainee functionality is implemented */}
				</View>

				<View style={styles.programStats}>
					<View style={styles.stat}>
						<Ionicons name="time-outline" size={16} color="#64748b" />
						<Text style={styles.statText}>
							{item.created_at
								? new Date(item.created_at).toLocaleDateString()
								: "No date"}
						</Text>
					</View>
					{/* TODO: Add exercise count and trainee count when data is available */}
					<View style={styles.stat}>
						<Ionicons name="fitness-outline" size={16} color="#64748b" />
						<Text style={styles.statText}>View details</Text>
					</View>
				</View>

				{/* TODO: Add progress section when progress tracking is implemented */}

				<View style={styles.difficultyBadge}>
					<Text style={styles.difficultyText}>
						{isTrainer ? "Created by you" : "Available"}
					</Text>
				</View>
			</Card>
		</TouchableOpacity>
	);

	const renderFilterTabs = () => (
		<View style={styles.filterTabs}>
			<TouchableOpacity
				style={[
					styles.filterTab,
					selectedFilter === "all" && styles.activeFilterTab,
				]}
				onPress={() => setSelectedFilter("all")}
			>
				<Text
					style={[
						styles.filterText,
						selectedFilter === "all" && styles.activeFilterText,
					]}
				>
					All
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.filterTab,
					selectedFilter === "enrolled" && styles.activeFilterTab,
				]}
				onPress={() => setSelectedFilter("enrolled")}
			>
				<Text
					style={[
						styles.filterText,
						selectedFilter === "enrolled" && styles.activeFilterText,
					]}
				>
					Enrolled
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.filterTab,
					selectedFilter === "available" && styles.activeFilterTab,
				]}
				onPress={() => setSelectedFilter("available")}
			>
				<Text
					style={[
						styles.filterText,
						selectedFilter === "available" && styles.activeFilterText,
					]}
				>
					Available
				</Text>
			</TouchableOpacity>
		</View>
	);

	if (isLoading) {
		return (
			<Screen>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#0891b2" />
					<Text style={styles.loadingText}>Loading programs...</Text>
				</View>
			</Screen>
		);
	}

	return (
		<Screen>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Programs</Text>
					{isTrainer && (
						<TouchableOpacity
							style={styles.createButton}
							onPress={handleCreateProgram}
						>
							<Ionicons name="add" size={24} color="#ffffff" />
						</TouchableOpacity>
					)}
				</View>

				{/* Filter Tabs */}
				{renderFilterTabs()}

				{/* Programs List */}
				<FlatList
					data={filteredPrograms}
					renderItem={renderProgram}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.programsList}
					onRefresh={isTrainer ? refetchTrainerPrograms : undefined}
					refreshing={isLoading}
					ListEmptyComponent={
						<View style={styles.emptyState}>
							<Ionicons name="fitness-outline" size={48} color="#64748b" />
							<Text style={styles.emptyTitle}>
								{isTrainer
									? "No programs created yet"
									: "No programs available"}
							</Text>
							<Text style={styles.emptySubtitle}>
								{isTrainer
									? "Create your first program to get started!"
									: "Check back later for available programs."}
							</Text>
							{isTrainer && (
								<Button
									title="Create Program"
									onPress={handleCreateProgram}
									style={styles.createProgramButton}
								/>
							)}
						</View>
					}
				/>
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
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "600",
		color: "#1e293b",
	},
	createButton: {
		backgroundColor: "#0891b2",
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#64748b",
	},
	filterTabs: {
		flexDirection: "row",
		marginBottom: 16,
		backgroundColor: "#f1f5f9",
		borderRadius: 8,
		padding: 4,
	},
	filterTab: {
		flex: 1,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 6,
		alignItems: "center",
	},
	activeFilterTab: {
		backgroundColor: "#ffffff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	filterText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#64748b",
	},
	activeFilterText: {
		color: "#0891b2",
	},
	programsList: {
		paddingBottom: 20,
	},
	programCard: {
		marginBottom: 16,
		padding: 16,
	},
	programHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	programInfo: {
		flex: 1,
	},
	programTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1e293b",
		marginBottom: 4,
	},
	programDescription: {
		fontSize: 14,
		color: "#64748b",
		lineHeight: 20,
	},
	enrolledBadge: {
		backgroundColor: "#0891b2",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	enrolledText: {
		fontSize: 12,
		fontWeight: "500",
		color: "#ffffff",
	},
	programStats: {
		flexDirection: "row",
		marginBottom: 12,
	},
	stat: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 16,
	},
	statText: {
		fontSize: 12,
		color: "#64748b",
		marginLeft: 4,
	},
	progressSection: {
		marginBottom: 12,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	progressLabel: {
		fontSize: 12,
		color: "#64748b",
	},
	progressPercentage: {
		fontSize: 12,
		fontWeight: "600",
		color: "#0891b2",
	},
	progressBar: {
		height: 4,
		backgroundColor: "#e2e8f0",
		borderRadius: 2,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#0891b2",
	},
	difficultyBadge: {
		alignSelf: "flex-start",
		backgroundColor: "#f1f5f9",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	difficultyText: {
		fontSize: 12,
		fontWeight: "500",
		color: "#64748b",
	},
	emptyState: {
		alignItems: "center",
		padding: 40,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1e293b",
		marginTop: 16,
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#64748b",
		textAlign: "center",
		marginTop: 8,
		marginBottom: 16,
	},
	createProgramButton: {
		marginTop: 8,
	},
});
