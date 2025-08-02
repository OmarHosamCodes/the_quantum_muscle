import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/src/hooks/useAuth";

export default function TabLayout() {
	const { session, loading } = useAuth();

	if (loading) {
		return null;
	}

	if (!session) {
		return <Redirect href="/sign-in" />;
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#0891b2",
				tabBarInactiveTintColor: "#64748b",
				tabBarStyle: {
					backgroundColor: "#ffffff",
					borderTopWidth: 1,
					borderTopColor: "#e2e8f0",
					paddingBottom: 5,
					paddingTop: 5,
					height: 60,
				},
				headerStyle: {
					backgroundColor: "#ffffff",
				},
				headerTitleStyle: {
					fontWeight: "600",
				},
			}}
		>
			<Tabs.Screen
				name="dashboard"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="feed"
				options={{
					title: "Feed",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="newspaper" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="programs"
				options={{
					title: "Programs",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="fitness" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="chats"
				options={{
					title: "Chats",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="chatbubbles" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="account"
				options={{
					title: "Account",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
