import { auth, db } from "../../database/firebase";
import request from "supertest";
import { server } from "../..";
import { fireBaseSignInWithEmail } from "../../database/utils";

const testUser = {
  uid: "123",
  email: "test@gmail.com",
  password: "Password123",
};

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
    await auth.createUser(testUser);
    // insert test data

    await db.collection("quizData").doc(quizDetailId).set(testQuizData);

    token = await fireBaseSignInWithEmail(testUser.email, testUser.password);
  });

  afterAll(async () => {
    // firebase clean up
    await auth.deleteUser(testUser.uid);
    await db.collection("quizData").doc(quizDetailId).delete();

    server.close();
  });

  it("test retrieving quiz details", async () => {
    const response = await request(server).post("/quiz/details").send({
      token: token,
      quizId: "testQuizData",
    });
    expect(response.body).toStrictEqual(testQuizData);
  });
});
