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

const useEmulator = true;

if (useEmulator) {
  process.env["GCLOUD_PROJECT"] = "babbling-on-2023";
  process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099";
  process.env["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8088";
  process.env["FIREBASE_STORAGE_EMULATOR_HOST"] = "127.0.0.1:9199";
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();
export const db = admin.firestore();

export const gestureMediaBucket = storage().bucket(
  "gs://babbling-on-2023.appspot.com"
);
