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

afterAll(() => { 
  server.close(); 
  return auth.deleteUser(testUser.uid); 
});

describe("Course Router Testing", () => { // changed
    const testCourseId = 'testCourseId'
  const testCourseData = {
    description: '',
    topicId: "1",
    name: 'test',
    // ownerId: testUser.uid, 
  };
  let token = "";

  beforeAll(async () => {
    // insert test data

    // await db.collection("courses").doc(testCourseId).set(testCourseData);
    token = await fireBaseSignInWithEmail(testUser.email, testUser.password);
    console.log("token", token)
  });

  afterAll(async () => {
    // firebase clean up
    // await db.collection("courses").doc(testCourseId).delete();
  });

  describe("Test endpoint: '/customCourses/post'", () => {
    const ENDPOINT = "/customCourses/post";

    it("Retrieves quiz details returns the correct data", async () => {
      const response = await request(server).post(ENDPOINT).send({...testCourseData, token: token});
      console.log(response);
      expect(response.body).toStrictEqual(testCourseData);
      expect(response.statusCode).toBe(201);
    });
 
  });

});
