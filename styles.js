import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1e1e1e", // Background color for safe area
  },
  container: {
    flex: 1,
    padding: 20, // Padding for the entire app
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    color: "#fff",
    fontSize: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  leaderboard: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  leaderboardList: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  leaderboardItem: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  fullLeaderboardText: {
    color: "#007BFF",
    textAlign: "center",
  },
  recentTags: {
    flex: 1,
  },
  tagImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default styles;
