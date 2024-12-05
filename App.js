import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import styles from "./styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="home" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.title}>Uni boys</Text>
          <TouchableOpacity>
            <Icon name="account" style={styles.icon} />
          </TouchableOpacity>
        </View>

        {/* Leaderboard Section */}
        <View style={styles.leaderboard}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          <View style={styles.leaderboardList}>
            <Text style={styles.leaderboardItem}>1. Berend123_</Text>
            <Text style={styles.leaderboardItem}>2. RYRY_theguy</Text>
            <Text style={styles.leaderboardItem}>3. Noano7</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.fullLeaderboardText}>
              Press for full leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Most Recent Tags Section */}
        <Text style={styles.sectionTitle}>Most recent tags</Text>
        <ScrollView style={styles.recentTags}>
          <TouchableOpacity>
            <Text style={styles.leaderboardItem}>Noah tagged ryan</Text>
            <Image
              style={styles.tagImage}
              source={require("./assets/test-images/test-0.jpg")}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.leaderboardItem}>Berend123_ tagged Noah</Text>
            <Image
              style={styles.tagImage}
              source={require("./assets/test-images/test-1.jpg")}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
