import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Popup from "./popup"; // Assuming you have a general popup component
import { fetchGames, createLobby, joinLobby } from "../utils/firebaseFunctions"; // Importing the functions

const GameViewer = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupName, setPopupName] = useState("");
  let loading = false;

  // Fetching lobbies where the current user is present
  useEffect(() => {
    fetchGames(setGames); // Use the imported function
  }, []);

  const handleOpenPopup = (field) => {
    setPopupName(field);
    setPopupVisible(true);
  };

  const handleClosePopup = (data) => {
    setPopupVisible(false);
    if (data) {
      if (popupName === "create") {
        const [lobbyName] = data; // Extract the input from the popup
        if (lobbyName) {
          createLobby({ lobbyName }); // Pass lobby name as additional data
        }
      } else {
        joinLobby(data[0]);
      }
    }
  };

  const renderGameItem = ({ item }) => (
    <View style={styles.gameItemContainer}>
      <View style={styles.gameInfo}>
        <Icon
          name="gamepad-variant"
          size={24}
          color="#000"
          style={styles.icon}
        />
        <Text style={styles.gameName}>{item.lobbyName}</Text>
        <Text style={styles.players}>{item.users.length} players</Text>
      </View>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => navigation.push("Lobby", { lobbyId: item.id })}
      >
        <Text style={styles.joinText}>Show Lobby</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {!popupVisible ? (
        <View style={styles.container}>
          <Text style={styles.header}>Current Games</Text>

          <FlatList
            data={games}
            keyExtractor={(item) => item.id}
            renderItem={renderGameItem}
            style={styles.list}
          />
          <TouchableOpacity
            style={[styles.createGameContainer, { marginBottom: 10 }]}
            onPress={() => handleOpenPopup("join")}
          >
            <Text style={styles.createText}>Join a game</Text>
            <Icon
              name="arrow-right"
              size={24}
              color="#007BFF"
              style={{ marginLeft: 0 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createGameContainer}
            onPress={() => handleOpenPopup("create")}
          >
            <Text style={styles.createText}>Create a Game</Text>
            <Icon
              name="arrow-right"
              size={24}
              color="#007BFF"
              style={{ marginLeft: 0 }}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          {popupName == "join" ? (
            <Popup
              title={`Join game`}
              placeholders={[`Game id`]}
              buttonText="Join"
              onClose={handleClosePopup}
            />
          ) : (
            <Popup
              title="Create game"
              placeholders={[`Game name`]}
              buttonText="Create"
              onClose={handleClosePopup}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 0,
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  list: {
    marginBottom: 20,
  },
  gameItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  gameInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  gameName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  players: {
    fontSize: 14,
    color: "#6C757D",
  },
  joinButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  joinText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  createGameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  createText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GameViewer;
