import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Navbar = ({ navigation, activeTab }) => {
  const isActive = (tab) => tab === activeTab;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navbarContainer}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Camera")}
          >
            <Icon
              name="camera"
              style={[styles.icon, isActive("Camera") && styles.activeIcon]}
            />
            <Text
              style={[styles.text, isActive("Camera") && styles.activeText]}
            >
              Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Home")}
          >
            <Icon
              name="home"
              style={[styles.icon, isActive("Home") && styles.activeIcon]}
            />
            <Text style={[styles.text, isActive("Home") && styles.activeText]}>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Account")}
          >
            <Icon
              name="account"
              style={[styles.icon, isActive("Account") && styles.activeIcon]}
            />
            <Text
              style={[styles.text, isActive("Account") && styles.activeText]}
            >
              Account
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures that the parent container takes up the full screen
  },
  safeArea: {
    flex: 1, // Ensures the SafeAreaView covers the entire screen
    justifyContent: "flex-end", // Aligns the navbar to the bottom of the screen
  },
  navbarContainer: {
    position: "absolute", // Fixes the navbar at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "white",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 5,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
    color: "#A0A0A0",
  },
  activeIcon: {
    color: "#000",
  },
  text: {
    fontSize: 12,
    color: "#A0A0A0",
  },
  activeText: {
    color: "#000",
    fontWeight: "600",
  },
});

export default Navbar;
