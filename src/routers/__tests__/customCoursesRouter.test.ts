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

describe("Course Router Testing", () => { // changed
    // const testCourseId = 'testCourseId'
  const testCourseData = {
    description: 'some thing ',
    topicId: "1",
    name: 'test',
    // ownerId: testUser.uid,  here?
  };
  let token = "";
  let courseId = "";
  let fakeCourse;

  beforeAll(async () => {    
    
    // await db.collection("courses").doc(testCourseId).set(testCourseData);
    token = await fireBaseSignInWithEmail(testUser.email, testUser.password);
    console.log("token", token)


        // create user
        // await prisma.user.create({
        //   data: {
        //     email: testUser.email,
        //     id: testUser.uid,
        //     role: "PROFESSOR",
            
        //   }
        // });
    
    // create course 
    fakeCourse = await prisma.course.create({
      data: {
        topicId: "1",
        name: "name", // lets do name
        description: "description",
        ownerId: "123", 
      },
    }); 

    // // make a test user to associate to courses
    // const testUser2 = {
    //   uid: "456",
    //   email: "test2@gmail.com",
    //   password: "<PASSWORD>",
    //   coursesTaken: [fakeCourse.id],
    // };
    
  });

  afterAll(async () => {
    // firebase clean up
    // await db.collection("courses").doc(testCourseId).delete();

    // prisma clean up
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    // update clean up 
    const prismaDeleteCheck = await prisma.course.findUnique({
      where: {
        id: fakeCourse.id,
      },
    });

    if(prismaDeleteCheck) {
      await prisma.course.delete({
        where: {
          id: fakeCourse.id,
        },
      });
    }

    // delete user
    // await prisma.user.delete({
    //   where: {
    //     id: testUser.uid,
    //   },
    // });
  });

  describe("Post endpoint: '/customCourses/post'", () => {
    const ENDPOINT = "/customCourses/post";

    it("Creates a course", async () => {
      const response = await request(server).post(ENDPOINT).send({...testCourseData, token: token});
      console.log("Response Text: ", response.text);
      courseId = response.body.course.id;
      expect(response.body.course.name).toStrictEqual(testCourseData.name); 
      // expect(response.body.data.description).toStrictEqual(testCourseData.description);
      expect(response.statusCode).toBe(201);
    });
 
  });

  describe("Get endpoint: '/customCourses/getCourse'", () => {
    const ENDPOINT = "/customCourses/getCourse/";

    it("Gets a course", async () => {
      const response = await request(server).post(ENDPOINT).send({
        courseId: fakeCourse.id // note to self: maybe adjust the naming later
      });

      expect(response.body.name).toStrictEqual("name");
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Get endpoint: '/customCourses/myCourses'", () => {
    const ENDPOINT = "/customCourses/myCourses/";

    it("Gets all courses made by an user", async () => {
      const response = await request(server).post(ENDPOINT).send({token: token});

      expect(response.body.courses.length).toBeGreaterThanOrEqual(1);
      expect(response.statusCode).toBe(200);
    })
  });

  // describe("Get endpoint: '/customCourses/takenCourses'", () => {
  //   const ENDPOINT = "/customCourses/takenCourses/";

  //   it("Gets all courses taken by an user", async () => {
  //     const response = await request(server).post(ENDPOINT).send({token: token, userId: testUser.uid});

  //     expect(response.body.courses.length).toBeGreaterThanOrEqual(1);
  //     expect(response.statusCode).toBe(200);
  //   })
  // });


  describe("Get endpoint: '/customCourses/getAll'", () => {
    const ENDPOINT = "/customCourses/getAll/";

    it("Gets a course", async () => {
      const response = await request(server).get(ENDPOINT);

      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.statusCode).toBe(200);
    });
  }); 


  describe("Update endpoint: '/customCourses/update'", () => {
    const ENDPOINT = "/customCourses/update/";

    it("Updates a course", async () => {
      const response = await request(server).patch(ENDPOINT + fakeCourse.id).send({name: "new name", description: "new description"});

      expect(response.body.name).toStrictEqual("new name");
      expect(response.body.description).toStrictEqual("new description");
      expect(response.statusCode).toBe(200);
    });

  });

  describe("Delete endpoint: '/customCourses/delete'", () => {
    const ENDPOINT = "/customCourses/delete/";

    it("Deletes a course", async () => {
      const response = await request(server).delete(ENDPOINT).send({
        customCourseId: fakeCourse.id
      });

      expect(response.statusCode).toBe(200);
    });

  });
});

describe("Featured testing", () => {

  let token = "";
  let courseIds = [];

  beforeAll(async () => {
    //  user
    token = await fireBaseSignInWithEmail(testUser.email, testUser.password);

    // make courses
    for (let i = 0; i < 6; i++) {
      const course = await prisma.course.create({
        data: {
          topicId: "1",
          name: "name" + i, 
          description: "description" + i,
          ownerId: "123",
        },
      });
      courseIds.push(course.id);
    }
  });

  afterAll(async () => {
    // firebase clean up
    // await db.collection("courses").doc(testCourseId).delete();

    // prisma clean up
    for (let i = 0; i < 6; i++) {
      await prisma.course.delete({
        where: {
          id: courseIds[i],
        },
      });
    }
  });

  it("Gets featured courses", async () => {
    const response = await request(server).post("/customCourses/Featured").send({token: token});

    expect(response.body.courses.length).toBe(5);
    expect(response.statusCode).toBe(200);
  });


});

describe("Delete all testing" , () => {

  let fakeCourse;
  let fakeCourse2;
  let token = "";

  beforeAll(async () => {

    token = await fireBaseSignInWithEmail(testUser.email, testUser.password);

    fakeCourse = await prisma.course.create({
      data: {
        topicId: "1",
        name: "name", 
        description: "description",
        ownerId: "123",
      },
    });
  })

  afterAll(async () => {
    // firebase clean up
    // await db.collection("courses").doc(testCourseId).delete();

    // prisma clean up
    const prismaDeleteCheck = await prisma.course.findUnique({
      where: {
        id: fakeCourse.id,
      },
    });

    if(prismaDeleteCheck) {
      await prisma.course.delete({
        where: {
          id: fakeCourse.id,
        },
      });
    }
  });

  it("Deletes all courses", async () => {
    const response = await request(server).post("/customCourses/deleteAll").send({courseId: fakeCourse.id, token: token});

    expect(response.statusCode).toBe(200);
  });
});
