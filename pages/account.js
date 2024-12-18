import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../utils/firebaseConfig"; // Assuming the firebaseConfig import is correct
import { ref, get } from "firebase/database";
import Popup from "../components/popup";
import Navbar from "../components/navbar";
import {
  handleSignOut,
  updateUsername,
  updateUserEmail,
} from "../utils/firebaseFunctions"; // Importing the functions

const AccountScreen = ({ navigation }) => {
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [username, setUsername] = useState(auth.currentUser?.uid || "");
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupName, setPopupName] = useState("");
  const user = auth.currentUser;

  // Fetch user data from Firebase
  useEffect(() => {
    if (user) {
      const userRef = ref(db, "users/" + user.uid);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUsername(snapshot.val().username);
            setEmail(auth.currentUser?.email || "");
          } else {
            console.log("No data available for this user");
          }
        })
        .catch((error) => {
          console.error("Error fetching username and email:", error);
        });
    }
  }, []);

  const handleSignOutPress = async () => {
    await handleSignOut(navigation); // Use imported function to sign out
  };

  const handleOpenPopup = (field) => {
    setPopupName(field);
    setPopupVisible(true);
  };

  const handleClosePopup = (data) => {
    setPopupVisible(false);
    if (data) {
      if (popupName === "username") {
        setUsername(data);
        updateUsername(data); // Use imported function to update username
      } else if (popupName === "email") {
        updateUserEmail(data); // Use imported function to update email
      }
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        {!popupVisible ? (
          <View style={[styles.content, { padding: 30 }]}>
            <Text style={styles.header}>Account</Text>

            {/* Email section */}
            <TouchableOpacity
              style={styles.infoContainer}
              onPress={() => handleOpenPopup("email")}
            >
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{email}</Text>
            </TouchableOpacity>

            {/* Username section */}
            <TouchableOpacity
              style={styles.infoContainer}
              onPress={() => handleOpenPopup("username")}
            >
              <Text style={styles.label}>Username</Text>
              <Text style={styles.value}>{username}</Text>
            </TouchableOpacity>

            {/* Sign out button */}
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOutPress}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {popupName === "username" ? (
              <Popup
                title={`Update username`}
                placeholders={[`Enter new username`]}
                buttonText="Submit"
                onClose={handleClosePopup}
              />
            ) : (
              <Popup
                title="Update Email"
                placeholders={["Current Email", "New Email", "Password"]}
                buttonText="Submit"
                onClose={handleClosePopup}
              />
            )}
          </View>
        )}
      </SafeAreaView>

      {/* Navbar */}
      <Navbar
        style={styles.navbar}
        navigation={navigation}
        activeTab={"Account"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#555",
  },
  signOutButton: {
    marginTop: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 16,
    color: "#e53935",
    fontWeight: "bold",
  },
  navbar: {
    height: 70,
    flexShrink: 0,
  },
});

export default AccountScreen;
