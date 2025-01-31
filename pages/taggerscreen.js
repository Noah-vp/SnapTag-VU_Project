import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getDatabase, ref, onValue } from "firebase/database";

const TaggerScreen = ({ navigation }) => {
  const { lobbyData, userDetails, lobbyId } = useRoute().params; // Receive data from route params
  const [locations, setLocations] = useState({}); // Store fetched locations

  useEffect(() => {
    // Fetch users' locations from Firebase Realtime Database
    const db = getDatabase();
    const locationsRef = ref(db, `lobbies/${lobbyId}/locations`);

    console.log(locationsRef);
    const unsubscribe = onValue(locationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLocations(data); // Update state with location data
        console.log();
      } else {
        console.log("No locations found.");
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [lobbyData.lobbyId]);

  // Map userDetails with their corresponding location
  const usersWithLocations = userDetails.map((user) => ({
    ...user,
    location: locations[user.uid]?.address || "Unknown",
    timeFetched:
      locations[user.uid]?.uploadTime.replace("T", " ").slice(0, -5) || "N/A",
  }));

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.ranking}>-</Text>
      <View style={styles.userDetails}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.description}>
          Last known location: {item.location}
        </Text>
        <Text style={styles.description}>
          Last time updated: {item.timeFetched}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.push("Lobby", { lobbyId: lobbyId })}
      >
        <Icon name="arrow-left" style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.lobbyName}>Locations</Text>
        <Text style={styles.lobbyId}>Lobby: {lobbyData.lobbyName}</Text>
      </View>
      <FlatList
        data={usersWithLocations}
        keyExtractor={(item) => item.uid}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  closeButton: {
    position: "absolute",
    top: 24,
    left: 10,
    padding: 10,
  },
  icon: {
    fontSize: 24,
    color: "black",
  },
  header: {
    marginBottom: 20,
  },
  lobbyName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  lobbyId: {
    fontSize: 14,
    color: "#6C757D",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  ranking: {
    fontSize: 18,
    fontWeight: "bold",
    width: 40,
    textAlign: "center",
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#6C757D",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default TaggerScreen;
