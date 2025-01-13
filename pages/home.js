import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";

import Navbar from "../components/navbar";
import Gameviewer from "../components/game_viewer";
import { SafeAreaView } from "react-native-safe-area-context";

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
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        {(() => {
          return (
            <Gameviewer
              navigation={navigation}
              style={styles.content}
            ></Gameviewer>
          );
        })()}
      </SafeAreaView>
      <View style={styles.navbar}>
        <Navbar navigation={navigation} activeTab={"Home"} />
      </View>
    </View>
  );
};

export default HomeScreen;
