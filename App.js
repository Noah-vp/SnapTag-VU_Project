import React, { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location"; // Import location functions
import { auth } from "./utils/firebaseConfig"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"; // Import the method for listening to auth state
import { updateUserLocation } from "./utils/firebaseFunctions"; // Importing the functions

import SignupScreen from "./pages/signup";
import HomeScreen from "./pages/home";
import LoginScreen from "./pages/login";
import AccountScreen from "./pages/account";
import LobbyScreen from "./pages/lobbyscreen";
import CameraScreen from "./pages/camera";
import TaggerScreen from "./pages/taggerscreen";

const Stack = createStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null initially to wait for auth state
  const [address, setAddress] = useState("");
  const currentUser = auth.currentUser;

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Request location permissions and log the current address
    const getLocationAndAddress = async (user) => {
      if (!user) return; // Ensure user exists
      try {
        const { status: foregroundStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Foreground location permission is required for this app to work properly. Please enable it in settings."
          );
          return;
        }

        // Get current location
        const locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Reverse geocode to get address
        const geocode = await Location.reverseGeocodeAsync(locationData.coords);
        if (geocode.length > 0) {
          const formattedAddress = `${geocode[0].name}, ${geocode[0].city}, ${geocode[0].region}, ${geocode[0].country}`;
          console.log("Current Address:", formattedAddress);

          // Pass the user.uid from onAuthStateChanged
          updateUserLocation(
            "-OFvpL53eLCpmToS7ws-",
            user.uid,
            formattedAddress
          );
          setAddress(formattedAddress); // Store the address if needed later
        } else {
          console.log("Unable to fetch address.");
        }
      } catch (error) {
        console.error("Error getting location or address:", error);
      }
    };

    // Listen for authentication state and get location when authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        getLocationAndAddress(user); // Pass the user object
      } else {
        setIsAuthenticated(false);
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    // Add a loading screen while Firebase is determining the authentication state
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Tagger" component={TaggerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
