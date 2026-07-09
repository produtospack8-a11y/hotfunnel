import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzlOdKZR1BDrGWLYKpJ36OfaE-1vw0yUk",
  authDomain: "hotfunnel-manager.firebaseapp.com",
  projectId: "hotfunnel-manager",
  storageBucket: "hotfunnel-manager.firebasestorage.app",
  messagingSenderId: "840058660893",
  appId: "1:840058660893:web:8f28b48a673d346739bef4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (use the provisioned firestoreDatabaseId)
export const db = getFirestore(app, "ai-studio-hotfunnelmanager-bdb1bf39-c031-4dba-b103-8ede5ee2a3c7");
