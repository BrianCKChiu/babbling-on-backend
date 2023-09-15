// Import the functions you need from the SDKs you need
import { storage } from "firebase-admin";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (process.env.FIREBASE_SERVICE_ACCOUNT == null) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
}

// Initialize Firebase
const buffServiceAcc = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT,
  "base64"
);

const serviceAccount = JSON.parse(buffServiceAcc.toString("ascii"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();
export const db = admin.firestore();

export const gestureMediaBucket = storage().bucket(
  "gs://babbling-on-2023.appspot.com"
);

export function authenticateUser(userId: string): boolean {
  if (userId == null) {
    return false;
  }
  return true;
}
