import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./utils/firebaseConfig"; // Import Firebase auth

import SignupScreen from "./pages/signup";
import HomeScreen from "./pages/home";
import LoginScreen from "./pages/login";
import AccountScreen from "./pages/account";
import LobbyScreen from "./pages/lobbyscreen";
import CameraScreen from "./pages/camera";
import { onAuthStateChanged } from "firebase/auth"; // Import the method for listening to auth state

const Stack = createStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null initially to wait for auth state

  useEffect(() => {
    // This will be triggered when the auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // User is signed in
      } else {
        setIsAuthenticated(false); // No user is signed in
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (isAuthenticated === null) {
    // Wait for the authentication state to be determined
    return null; // Or show a loading screen
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
