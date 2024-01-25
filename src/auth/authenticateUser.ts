import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import admin from "firebase-admin";
import { HttpError } from "../types/errors/authenticationError";

export async function authenticateUser(token: string): Promise<DecodedIdToken> {
  if (token == null) {
    throw new HttpError(400, "Invalid Token");
  }
  // then here
  const user = await authenticateToken(token); // ERROR HERE
  if (user == null) {
    throw new HttpError(401, "Unauthorized");
  }
  return user;
}

async function authenticateToken( // TO HERE
  token: string
): Promise<DecodedIdToken | null> {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (e) {
    // end here
    throw new HttpError(500, "Internal Server Error: " + e); // TO HERE
  }
}
