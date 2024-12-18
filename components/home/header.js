import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Header = ({ navigation, activeTab, onTabChange }) => {
  const isActive = (tab) => tab === activeTab;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbarContainer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange("Games")}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.text, isActive("Games") && styles.activeText]}>
              Games
            </Text>
          </View>
          <View style={styles.lineContainer}>
            <View style={styles.grayLine} />
            {isActive("Games") && <View style={[styles.activeIndicator]} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabChange("Feed")}
        >
          <View style={styles.iconContainer}>
            <Text style={[styles.text, isActive("Feed") && styles.activeText]}>
              Feed
            </Text>
          </View>
          <View style={styles.lineContainer}>
            <View style={styles.grayLine} />
            {isActive("Feed") && <View style={[styles.activeIndicator]} />}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingBottom: 20,
  },
  navbarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    width: "100%",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
  },
  text: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#A0A0A0",
  },
  activeText: {
    fontWeight: "bold",
    color: "#000",
    fontWeight: "600",
  },
  lineContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  grayLine: {
    width: "100%",
    height: 3,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
  },
  activeIndicator: {
    position: "absolute",
    width: "100%",
    height: 3,
    backgroundColor: "#007BFF",
    borderRadius: 2,
    bottom: 0,
  },
});

export default Header;
