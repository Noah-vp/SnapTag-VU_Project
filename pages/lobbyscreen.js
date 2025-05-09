import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Clipboard,
  ToastAndroid,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Correct import
import {
  fetchLobbyDetails,
  fetchImagesWithCaptions,
  isTagger,
} from "../utils/firebaseFunctions"; // Importing the functions
import { auth } from "../utils/firebaseConfig";

const LobbyScreen = ({ navigation }) => {
  const { lobbyId } = useRoute().params;
  const [lobbyData, setLobbyData] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [tagger, setTagger] = useState("");
  const [feedExpended, setFeedExpended] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      const { lobbyData, userDetails } = await fetchLobbyDetails(lobbyId); // Use imported function
      setLobbyData(lobbyData);
      setUserDetails(userDetails);
      const images = await fetchImagesWithCaptions(
        lobbyData.images,
        userDetails
      ); // Use imported function
      setImageUrls(images);
      for (const user of userDetails) {
        const isUserTagger = await isTagger(lobbyId, user.uid);
        if (isUserTagger) {
          //console.log("Tagger UID:", user.uid); // Ensure user.uid is valid
          setTagger(user.uid);
        }
      }
    };

    fetchData();
  }, [lobbyId]);

  const copyToClipboard = () => {
    Clipboard.setString(lobbyId); // Copy lobbyId to clipboard
    ToastAndroid.show("Lobby ID copied to clipboard!", ToastAndroid.SHORT);
  };
  const renderUserItem = ({ item }) => {
    const isCurrentUser = item.uid === currentUser.uid; // Compare the item.uid with the current authenticated user's uid
    const isCurrentTagger = item.uid === tagger;

    return (
      <View
        style={[
          styles.userItem,
          isCurrentTagger && { backgroundColor: "#ffd0d0" },
        ]}
      >
        <Text style={styles.ranking}>{item.ranking}</Text>
        <View style={styles.userDetails}>
          <Text
            style={[
              styles.username,
              isCurrentTagger && { color: "red" },
              isCurrentUser && { color: "#007BFF" }, // Apply blue color if the user is the current user
            ]}
          >
            {item.username}
          </Text>
          <Text style={styles.uid}>
            Time spent as tagger: {item.totalTaggerTime} min
          </Text>
          <Text style={styles.uid}>ID: {item.uid}</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.push("Tagger", {
              lobbyData: lobbyData,
              userDetails: userDetails,
              lobbyId: lobbyId,
            })
          }
          style={[
            styles.iconWrapper,
            isCurrentUser && isCurrentTagger && { display: "flex" },
          ]}
        >
          <Icon name="map-marker" style={styles.icon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderImageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <Text>No Image Available</Text>
      )}
      <Text style={styles.caption}>{item.caption}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {lobbyData ? (
        <>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Icon name="arrow-left" style={{ fontSize: 24, color: "black" }} />
          </TouchableOpacity>
          <View style={styles.header}>
            <View>
              <Text style={styles.lobbyName}>{lobbyData.lobbyName}</Text>
              <Text style={styles.lobbyId}>ID: {lobbyId}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyToClipboard}
            >
              <Icon name="content-copy" style={styles.copyIcon} />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.rankingContainer,
              feedExpended ? { height: 200 } : { flex: 1 },
            ]}
          >
            <FlatList
              style={[{ flex: 1 }]}
              data={userDetails}
              keyExtractor={(item) => item.uid}
              renderItem={renderUserItem}
            />
          </View>
          {feedExpended == true ? (
            <View>
              <TouchableOpacity
                style={styles.feedExpender}
                onPress={() => setFeedExpended(false)}
              >
                <Text style={styles.feedExpenderText}>Collapse Feed</Text>
                <Icon
                  name="arrow-down"
                  size={24}
                  color="#007BFF"
                  style={{ marginLeft: 0 }}
                />
              </TouchableOpacity>
              <FlatList
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#CCC",
                  paddingTop: 10,
                }}
                data={imageUrls}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderImageItem}
                contentContainerStyle={styles.imageList}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.feedExpender}
              onPress={() => setFeedExpended(true)}
            >
              <Text style={styles.feedExpenderText}>Show Feed</Text>
              <Icon
                name="arrow-up"
                size={24}
                color="#007BFF"
                style={{ marginLeft: 0 }}
              />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.loadingText}>Loading lobby details...</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 24, // Adjust top to your need
    left: 10,
    padding: 15,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  lobbyName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  lobbyId: {
    fontSize: 14,
    color: "#6C757D", // Gray color
  },
  copyButton: {
    backgroundColor: "#F0F0F0",
    padding: 8,
    borderRadius: 8,
  },
  copyIcon: {
    fontSize: 20,
    color: "black",
  },
  rankingList: {
    paddingBottom: 190,
  },
  imageList: {
    alignSelf: "center",
  },
  ranking: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    width: 40, // Consistent width
    alignSelf: "center",
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
  userDetails: {
    flex: 1,
    flexDirection: "column",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  uid: {
    fontSize: 14,
    color: "#6C757D",
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "#DC3545",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#6C757D",
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    zIndex: 1000,
  },
  caption: {
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
    color: "#555",
  },
  rankingContainer: {
    borderBottomWidth: 1, // Add a bottom border
    borderBottomColor: "#CCC", // Light gray for subtle separation
    marginVertical: 10,
  },
  feedExpender: {
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
    marginBottom: 10,
  },
  feedExpenderText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 40, // Same width as ranking
    height: 40, // Same height for consistency
    display: "none", // Default to hidden
  },
  icon: {
    fontSize: 28, // Match ranking font size
    color: "black",
    alignSelf: "center",
  },
});

export default LobbyScreen;
