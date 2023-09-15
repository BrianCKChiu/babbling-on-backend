// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyBqt1Yri0-e9XuzmYlwe7HHU9B3HLcVZVI",
  authDomain: "babbling-on-2023.firebaseapp.com",
  projectId: "babbling-on-2023",
  storageBucket: "babbling-on-2023.appspot.com",
  messagingSenderId: "191705213962",
  appId: "1:191705213962:web:656ad8754236dd1c4843f3",
  measurementId: "G-GY8HKDMZ21",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

export const db = getFirestore(app);
export const auth = getAuth(app);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export function authenticateUser(userId: string): boolean {
  if (userId == null) {
    return false;
  }
  return true;
}
