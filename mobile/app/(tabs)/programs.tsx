import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Screen } from "@/src/components/ui/Screen";
import { useAuth } from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

// Mock data for demonstration
const mockPrograms = [
	{
		id: "1",
		title: "Beginner Strength",
		description:
			"A comprehensive 8-week program designed for beginners looking to build strength and muscle.",
		duration_weeks: 8,
		difficulty: "Beginner",
		exercises_count: 24,
		enrolled_trainees: 12,
		created_by: "trainer_1",
		is_enrolled: true,
		progress_percentage: 37.5,
	},
	{
		id: "2",
		title: "Advanced Powerlifting",
		description:
			"Advanced program focusing on the big three lifts: squat, bench, and deadlift.",
		duration_weeks: 12,
		difficulty: "Advanced",
		exercises_count: 18,
		enrolled_trainees: 8,
		created_by: "trainer_1",
		is_enrolled: false,
		progress_percentage: 0,
	},
	{
		id: "3",
		title: "Cardio & Conditioning",
		description:
			"High-intensity cardio program to improve endurance and overall fitness.",
		duration_weeks: 6,
		difficulty: "Intermediate",
		exercises_count: 15,
		enrolled_trainees: 20,
		created_by: "trainer_2",
		is_enrolled: false,
		progress_percentage: 0,
	},
];

// Mock function to fetch programs
const fetchPrograms = async (userType: string, userId: string) => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	if (userType === "trainer") {
		// Trainers see their own programs
		return mockPrograms.filter((program) => program.created_by === userId);
	} else {
		// Trainees see programs they're enrolled in or available programs
		return mockPrograms;
	}
};

export default function ProgramsScreen() {
	const { user } = useAuth();
	const [selectedFilter, setSelectedFilter] = useState<
		"all" | "enrolled" | "available"
	>("all");

	const {
		data: programs = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["programs", user?.id, user?.user_type],
		queryFn: () => fetchPrograms(user?.user_type || "trainee", user?.id || ""),
		enabled: !!user,
	});

	const isTrainer = user?.user_type === "trainer";

	const filteredPrograms = programs.filter((program) => {
		if (selectedFilter === "enrolled") return program.is_enrolled;
		if (selectedFilter === "available") return !program.is_enrolled;
		return true;
	});

	const handleCreateProgram = () => {
		// TODO: Navigate to create program screen
		Alert.alert("Create Program", "This will open the program creation screen");
	};

	const handleProgramPress = (programId: string) => {
		router.push(`/programs/${programId}`);
	};

	const renderProgram = ({ item }: { item: any }) => (
		<TouchableOpacity onPress={() => handleProgramPress(item.id)}>
			<Card style={styles.programCard}>
				<View style={styles.programHeader}>
					<View style={styles.programInfo}>
						<Text style={styles.programTitle}>{item.title}</Text>
						<Text style={styles.programDescription}>{item.description}</Text>
					</View>
					{item.is_enrolled && (
						<View style={styles.enrolledBadge}>
							<Text style={styles.enrolledText}>Enrolled</Text>
						</View>
					)}
				</View>

				<View style={styles.programStats}>
					<View style={styles.stat}>
						<Ionicons name="time-outline" size={16} color="#64748b" />
						<Text style={styles.statText}>{item.duration_weeks} weeks</Text>
					</View>
					<View style={styles.stat}>
						<Ionicons name="fitness-outline" size={16} color="#64748b" />
						<Text style={styles.statText}>
							{item.exercises_count} exercises
						</Text>
					</View>
					<View style={styles.stat}>
						<Ionicons name="people-outline" size={16} color="#64748b" />
						<Text style={styles.statText}>
							{item.enrolled_trainees} trainees
						</Text>
					</View>
				</View>

				{item.is_enrolled && item.progress_percentage > 0 && (
					<View style={styles.progressSection}>
						<View style={styles.progressHeader}>
							<Text style={styles.progressLabel}>Progress</Text>
							<Text style={styles.progressPercentage}>
								{item.progress_percentage}%
							</Text>
						</View>
						<View style={styles.progressBar}>
							<View
								style={[
									styles.progressFill,
									{ width: `${item.progress_percentage}%` },
								]}
							/>
						</View>
					</View>
				)}

				<View style={styles.difficultyBadge}>
					<Text style={styles.difficultyText}>{item.difficulty}</Text>
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
			{!isTrainer && (
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
			)}
		</View>
	);

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
