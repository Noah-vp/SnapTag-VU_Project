import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";

import Navbar from "../components/navbar";
import Header from "../components/home/header";
import Gameviewer from "../components/home/game_viewer";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  navbar: {
    height: 70,
    flexShrink: 0,
  },
});

const HomeScreen = ({ navigation }) => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState("Games");

  // Function to handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Header
        navigation={navigation}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      ></Header>
      <View style={styles.content}>
        {(() => {
          switch (activeTab) {
            case "Games":
              return (
                <Gameviewer
                  navigation={navigation}
                  style={styles.content}
                ></Gameviewer>
              );
            case "Feed":
              return <Text>This is the Feed.</Text>;
            default:
              return <Text>Select a tab.</Text>;
          }
        })()}
      </View>
      <View style={styles.navbar}>
        <Navbar navigation={navigation} activeTab={"Home"} />
      </View>
    </View>
  );
};

export default HomeScreen;
