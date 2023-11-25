import { auth, db } from "../../database/firebase";
import request from "supertest";
import { server } from "../..";
import { fireBaseSignInWithEmail } from "../../database/utils";

const testUser = {
  uid: "123",
  email: "test@gmail.com",
  password: "Password123",
};
beforeAll(async () => {
  // create user
  await auth.createUser(testUser);
});

afterAll(async () => {
  // firebase clean up
  await auth.deleteUser(testUser.uid);
  server.close();
});

describe("Quiz Router Testing", () => {
  const quizDetailId = "testQuizData";
  const testQuizData = {
    description: {},
    estTime: 4,
    exp: 200,
    numOfQuestions: 5,
    topic: "abc",
  };
  let token = "";

  beforeAll(async () => {
    // insert test data
    await db.collection("quizData").doc(quizDetailId).set(testQuizData);
    token = await fireBaseSignInWithEmail(testUser.email, testUser.password);
  });

  afterAll(async () => {
    // firebase clean up
    await db.collection("quizData").doc(quizDetailId).delete();
  });

  describe("Test endpoint: '/quiz/details'", () => {
    const ENDPOINT = "/quiz/details";

    it("retrieving quiz details returns the correct data", async () => {
      const response = await request(server).post(ENDPOINT).send({
        token: token,
        quizId: "testQuizData",
      });
      expect(response.body).toStrictEqual(testQuizData);
      expect(response.statusCode).toBe(200);
    });

    it("the response when no quiz details was found", async () => {
      const response = await request(server).post(ENDPOINT).send({
        token: token,
        quizId: "1234",
      });
      expect(response.statusCode).toBe(404);
      expect(response.body).toStrictEqual({
        message: "Quiz details not found",
      });
    });
  });
});
