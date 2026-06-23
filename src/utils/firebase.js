import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Try reading custom localStorage configuration first
let firebaseConfig = null;
let isFirebaseConfigured = false;

try {
  const configString = localStorage.getItem("omii_storage_config");
  if (configString) {
    const parsed = JSON.parse(configString);
    if (parsed.type === "firebase" && parsed.configJSON) {
      firebaseConfig = parsed.configJSON;
      isFirebaseConfigured = true;
    }
  }
} catch (e) {
  console.warn("Could not read dynamic Firebase config:", e);
}

// Fallback to environment variables if not dynamically configured
if (!isFirebaseConfigured) {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  isFirebaseConfigured = 
    !!firebaseConfig.apiKey && 
    !!firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

let app;
let auth;
let db;
let storage;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    isFirebaseConfigured = false;
  }
} else {
  console.warn("Firebase configuration missing or incomplete. Operating in fallback modes.");
}

export { app, auth, db, storage, isFirebaseConfigured };
