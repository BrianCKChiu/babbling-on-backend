import { auth, db } from "../../database/firebase";
import request from "supertest";
import { server } from "../..";
import { fireBaseSignInWithEmail } from "../../database/utils";
import prisma from "../../database/prisma";

// for authentication purposes
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

  describe("Gesture Router Testing", () => {


    const testGestureData = {
        id: 'fakeGestureId',
        phrase: 'Fake Gesture',
        verified: true,
        topicId: 'fakeTopicId',
        lessonId: 'fakeLessonId', // might need to edit this to match a lesson to test the relationships...
        topic: {
          id: 'fakeTopicId',
          name: 'fakeTopicName',
          // missing gestures list and courses list... needed here? and if so how do i add it
        },
        lesson: {
          id: 'fakeLessonId',
          name: 'fakeLessonName',
          description: 'fakeLessonDescription',
          courseId: 'fakeCourseId',
          // missing gestures list and courses list... needed here? and if so how do i add it helpp
    },
    };

    let token = "";
    let lessonId = "";
    let fakeGesture;

    beforeAll(async () => {

        // token authentication
        token = await fireBaseSignInWithEmail(testUser.email, testUser.password);
        console.log("token", token)

        // create a fake gesture
        fakeGesture = await prisma.gesture.create({
          data: {
            phrase: testGestureData.phrase,
            verified: testGestureData.verified,
            topicId: testGestureData.topicId,
            lessonId: testGestureData.lessonId,
          },
          include: {},
        });


    });

    afterAll(async () => {
        // delete fake gesture
        await prisma.gesture.delete({
          where: {
            id: fakeGesture.id,
          },
        });
    });

    // endpoints start here
  })