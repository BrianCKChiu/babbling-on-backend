import admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export async function authenticateToken(
  token: string
): Promise<DecodedIdToken | null> {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (e) {
    return null;
  }
}
