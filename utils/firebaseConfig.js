import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyDuYExJNfSzYP3LTKU07ubfAP3Bjl-TKRY",
  authDomain: "snaptag-85eff.firebaseapp.com",
  databaseURL:
    "https://snaptag-85eff-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "snaptag-85eff",
  storageBucket: "snaptag-85eff.firebasestorage.app",
  messagingSenderId: "846417879453",
  appId: "1:846417879453:web:8085dae6e60f5bc8098f74",
};

// Check if the app is already initialized
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp(); // Use the existing instance
}

// Initialize Firebase Authentication with AsyncStorage persistence
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firebase Database
const db = getDatabase(firebaseApp);

// Initialize Firebase Storage
const storage = getStorage(firebaseApp);

// Export Firebase services for use in your app
export { auth, db, storage, firebaseApp };
