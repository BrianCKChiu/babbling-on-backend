import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import fs from "fs";

export async function initializeTestFirebase() {
  return await initializeTestEnvironment({
    projectId: "test-env-babbling-on",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });
}
