import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import admin from "firebase-admin";

export async function authenticateUser(token: string): Promise<DecodedIdToken> {
  if (token == null) {
    throw new Error("Invalid Token");
  }

  const user = await authenticateToken(token);
  if (user == null) {
    throw new Error("Unauthorized");
  }
  return user;
}

async function authenticateToken(
  token: string
): Promise<DecodedIdToken | null> {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (e) {
    return null;
  }
}
