import { auth, db } from "../../database/firebase";
import request from "supertest";
import { server } from "../..";
import { fireBaseSignInWithEmail } from "../../database/utils";
import prisma from "../../database/prisma";

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

  describe("Lesson Router Testing", () => {

    const testLessonData = {
        description: 'some thing ',
        name: "1",
        courseId: "",
        gestures: [],
      };

      let token = "";
      let lessonId = "";
      let fakeLesson;

      beforeAll(async () => { 

        token = await fireBaseSignInWithEmail(testUser.email, testUser.password);
        console.log("token", token)

        // create fake lesson
        fakeLesson = await prisma.lesson.create({
          data: {
            description: testLessonData.description,
            name: testLessonData.name,
            courseId: testLessonData.courseId,
          },
        });


          
      });

      afterAll(async () => {
        // delete fake lesson
        await prisma.lesson.delete({
          where: {
            id: fakeLesson.id,
          },
        });
      });

      describe("Get endpoint: 'LessonRouter/lessons'", () => {
        it("should return a list of lessons", async () => {
          const res = await request(server)
           .get("/lessons")
           .set("Authorization", `Bearer ${token}`);

          expect(res.status).toBe(200);
          expect(res.body).toHaveLength(1);
        });
      });

      // add a lesson 
      describe("Post endpoing: 'LessonRouter/post'", () => {
        const ENDPOINT = "/LessonRouter/post";

        it("Creates a lesson", async () => {
          const response = await request(server).post(ENDPOINT).send({...testLessonData, token: token});
        
          console.log("Response Text for Post method in Lesson Router Test: ", response.text);
          lessonId = response.body.lesson.id;
          expect(response.body.lesson.name).toStrictEqual(testLessonData.name);
          // expect(response.body.data.description).toStrictEqual(testCourseData.description);
          expect(response.statusCode).toBe(201);
        });
      });

      // get a lesson
      describe("Get endpoint: '/LessonRouter/getLesson'", () => {
        const ENDPOINT = "/LessonRouter/getLesson/";

        it("Gets a lesson", async () => {
          const response = await request(server).post(ENDPOINT).send({
            lessonId: fakeLesson.id // note to self: maybe adjust the naming later
          });

          expect(response.body.name).toStrictEqual("name");
          expect(response.statusCode).toBe(200);
        });
      });

      // update a lesson
      describe("Update endpoint: 'LessonRouter/update'", () => {
        const ENDPOINT = "/LessonRouter/update";

        it("Updates a lesson", async () => {
          const response = await request(server).patch(ENDPOINT + fakeLesson.id).send({name: "new name", description: "new description"});

          console.log("Response Text for Update Endpoint in Lesson Router Test: ", response.text);
          lessonId = response.body.lesson.id;
          expect(response.body.lesson.name).toStrictEqual("new name");
          expect(response.body.data.description).toStrictEqual("new description");
          expect(response.statusCode).toBe(200);
        });
      });

      // delete a lesson
      describe("Delete endpoint: 'LessonRouter/delete'", () => {
        const ENDPOINT = "/LessonRouter/delete";

        it("Deletes a lesson", async () => {
          const response = await request(server).delete(ENDPOINT).send({lessonId: fakeLesson.id});

          expect(response.statusCode).toBe(200);
        });
      });
      
    }
  );