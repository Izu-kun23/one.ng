import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBEr55xVNT2kSJUSs6RPT7fbwPVnNRDuFA",
  authDomain: "plusultra-865dc.firebaseapp.com",
  projectId: "plusultra-865dc",
  storageBucket: "plusultra-865dc.firebasestorage.app",
  messagingSenderId: "663312053578",
  appId: "1:663312053578:web:0c466ef4650fabeb6fbdb3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use AsyncStorage for persistence in Firebase Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };