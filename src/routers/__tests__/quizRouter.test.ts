import { auth, db } from "../../database/firebase";
import request from "supertest";
import { server } from "../..";
import { fireBaseSignInWithEmail } from "../../database/utils";
import { Quiz } from "../../components/quiz/quiz";

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

    it("Retrieves quiz details returns the correct data", async () => {
      const response = await request(server).post(ENDPOINT).send({
        token: token,
        quizId: "testQuizData",
      });
      expect(response.body).toStrictEqual(testQuizData);
      expect(response.statusCode).toBe(200);
    });

    it("Returns a 404 error when no quiz details was found", async () => {
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

  describe("Test endpoint: '/quiz/create'", () => {
    const ENDPOINT = "/quiz/create";

    it("checks quiz data returned is valid", async () => {
      const response = await request(server).post(ENDPOINT).send({
        token: token,
        topic: "1",
      });
      expect(response.statusCode).toBe(200);

      const quizData: Quiz = response.body;
      expect(quizData.quizResults.length).toBe(0);
      expect(quizData.questions.length).toBe(5);
      expect(quizData.status).toBe("incomplete");
    });

    it("returns 400 error when quiz length is less than 5", async () => {
      const response = await request(server)
        .post(ENDPOINT)
        .send({
          token: token,
          topic: "1",
          options: { length: 2 },
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: "Quiz length cannot be less than or equal than 0",
      });
    });
  });
});
