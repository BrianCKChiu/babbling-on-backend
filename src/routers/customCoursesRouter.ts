import express from "express";
import prisma from "../database/prisma";
import { Request, Response } from "express";
import { authenticateUser } from "../auth/authenticateUser";
const customCoursesRouter = express.Router();

/**
 * Get all courses created by the user
 * @param {string} token user's token 
 * @param {string} courseId
 * @returns {Response}
 */

// HOMEPAGE CUSTOM COURSES ROUTE 
customCoursesRouter.post("/customCoursesRoute", async (req, res) => {
  try {
    const { token } = req.body;
    console.log(req.body);
    const user = await authenticateUser(token);    // USER IS AUTHENTICATED and set the user to user from fb db

    // find the user in the prisma db by email because id didnt work (ask why later)
    const userDB = await prisma.user.findUnique({
      where : {email : user.email}
    })

  if(!userDB) { 
    // USER IS NOT AUTHENTICATED
   return res.status(401).json({error: "Not authenticated"});
  }

  // Get all courses and filter into user's courses vs other... custom courses
  const courses = await prisma.course.findMany({
    // take : 3,
    where: {
      OR: [
        { owner: {role: "TUTOR"} }, 
        { owner: {role: "PROFESSOR"} },
        { owner: {role: "ADMIN"} },
      ] 
    },
    include: { lessons: true },
  });  

  console.log("courses in backend", courses);
  console.log("user", user);

  // check if the user is a role tutor or prof
  if(userDB.role !== "TUTOR" && userDB.role !== "PROFESSOR") {
    // ok if this DO NOT LOAD "My Courses tab"

    console.log("User and their role ", userDB, userDB.role); // wait 
    return res.status(200).json({otherCourses: courses, "message" : "You are not authorized to create Custom Courses"}); 
  }  

  const myCourses = courses.filter(c => c.ownerId === user.uid);
  const otherCourses = courses.filter(c => c.ownerId !== user.uid);

  console.log("myCourses", myCourses);
  console.log("otherCourses", otherCourses);

  // RETURN THE USER'S COURSES AND OTHERS IN THE JSON
  
  // res.json({myCourses, otherCourses});
  return res.status(200).json({myCourses, otherCourses});

 } catch (error) {
  res.status(500).json({error: "Internal server error"});
 }
});

// HOMEPAGE EXPLORE COURSES ROUTE 
customCoursesRouter.post("/exploreCoursesRoute", async (req, res) => {

  try {
    const { token } = req.body;
    console.log(req.body);
    const user = await authenticateUser(token);    

    const userDB = await prisma.user.findUnique({
      where : {email : user.email}
    })

  if(!userDB) { 
    // USER IS NOT AUTHENTICATED
   return res.status(401).json({error: "Not authenticated"});
  }

  // GET ALL EXPLORE COURSES
  const exploreCourses = await prisma.course.findMany({
    where: {
      OR: [
        { owner: {role: "ADMIN"} },
      ] 
    },
    take : 3,
    include: {
      lessons: true,
    },
  });  

  console.log("explore Courses", exploreCourses);
  console.log("user", user);

  // GET ALL FEATURED COURSES 
    const featuredCourses = await prisma.course.findMany({
      take: 3,
      include: {
        lessons: true,
      },
    });

  console.log("explore Courses", exploreCourses);
  console.log("featured Courses", featuredCourses);
  
  // res.json({myCourses, otherCourses});
  return res.status(200).json({exploreCourses, featuredCourses});

 } catch (error) {
  res.status(500).json({error: "Internal server error"});
 }
});

// get courses made by the user 
customCoursesRouter.post("/myCourses", async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const user = await authenticateUser(token);

    if (user == null) {
      return res.status(401).json({ error: "Not Authenticated" });
    }
    const userCourses = await prisma.course.findMany({
      where: { ownerId: user.uid },
    });

    res.status(200).json({ courses: userCourses });
  } catch (e) {
    res.status(500).send(`Internal server error: ${e}`);
  }
});

// get courses taken by the user
customCoursesRouter.post(
  "/takenCourses",
  async (req: Request, res: Response) => {
    try {
      const { token, userId } = req.body;

      const isValidUser = await authenticateUser(token);

      if (!isValidUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // query for the user with that id and include the coursesTaken relation
      const userWithCourses = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          coursesTaken: true,
        },
      });

      // send the coursesTaken back in the response
      res.json(userWithCourses.coursesTaken);
    } catch (error) {
      res.status(500).send(`Internal server error: ${error}`);
    }
  }
);

// get an invidual course
customCoursesRouter.post("/getCourse", async (req: Request, res: Response) => {
  const { courseId } = req.body;
  console.log("course id: ",courseId);

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: true,
      },
    });
    if (!course) {
      res.status(404).json({ error: "Course not found" });
    } else {
      res.status(200).json(course);
    }
  } catch (error) {
    console.error("Error getting course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Delete all lessons and gestures associated with a course and delete the course
 * @param {string} token user's token
 * @param {string} courseId course
 * @returns {Response}
 */
customCoursesRouter.post("/deleteAll", async (req: Request, res: Response) => {
  const { token, courseId } = req.body;
  console.log(req.body);
  if (token == null || courseId == null) {
    return res
      .status(400)
      .json({ error: "Bad request: Token and course id required" });
  }

  try {
    const user = await authenticateUser(token);

    if (user == null) {
      return res.status(401).json({ error: "Not Authenticated" });
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    console.log(course);
    if (course.ownerId !== user.uid) {
      return res.status(401).json({ error: "Insufficient permissions" });
    }

    const courseLessons = await prisma.lesson.findMany({
      where: { courseId: courseId },
    });

    const gestureList = await prisma.gesture.findMany({
      where: { lessonId: { in: courseLessons.map((lesson) => lesson.id) } },
    });

    await prisma.lesson.deleteMany({
      where: { courseId: courseId },
    });

    await prisma.gesture.deleteMany({
      where: { lessonId: { in: courseLessons.map((lesson) => lesson.id) } },
    });

    await prisma.gestureMedia.deleteMany({
      where: { gestureId: { in: gestureList.map((gesture) => gesture.id) } },
    });

    await prisma.course.delete({
      where: { id: courseId },
    });

    res.status(200).json({ message: "Course deleted" });
  } catch (e) {
    console.log(e);
    res.status(500).send(`Internal server error: ${e}`);
  }
});

/**
 * Get 5 courses to display on the home page featured section
 * * @param {string} token user's token
 */
customCoursesRouter.post("/featured", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    console.log(req.body);
    await authenticateUser(token);

    const courses = await prisma.course.findMany({
      take: 5,
      include: {
        lessons: true,
      },
    });

    res.status(200).json({ courses: courses });
  } catch (e) {
    res.status(500).send(`Internal server error: ${e}`);
  }
});

// GET ALL COURSES
customCoursesRouter.get("/getAll", async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findMany({
      include: {
        lessons: true,
      },
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
    } else {
      res.json(course);
    }
  } catch (error) {
    res.status(500).send(`Internal server error: ${error}`);
  } 
});

// GET ALL CUSTOM COURSES
export async function getCustomCourses(req: Request, res: Response){
  try{
    const customCourses = await prisma.course.findMany({ 
      where: {
        OR: [
          {owner: { role: "TUTOR" }},
          {owner: { role: "PROFESSOR" }},
        ]
      },
      include: {
        lessons: true,
      },
    }); 

    console.log("customCourses before if check", customCourses);

    if (!customCourses) { 
      res.status(404).json({ error: "Course not found" }); 
    } else {   
      res.json(customCourses);  
      console.log("Custom Courses in backend", customCourses);
    }

  } catch (error) {
    res.status(500).send(`Internal server error: ${error}`);
  } 
}

customCoursesRouter.get("/getCustomCourses",getCustomCourses);

// MAKES A COURSE
customCoursesRouter.post("/post", async (req: Request, res: Response) => {
  try {
    // test
    console.log("req body log inside custom courses router: ", req.body);

    // const { name, description, topicId}: { name: string; description: string; topicId: String} = req.body;
    const { name, description, topicId, token } = req.body; 
    const user = await authenticateUser(token);

    const result = await prisma.course.create({
      data: {
        topicId: "1",
        name: name,
        description: description,
        ownerId: user.uid, 
       
      },
    }); 
    console.log("Result in /post method: ",result);
    // verify the userId has a role of tutor or teacher
    // if (userId !== tutor || teacher) {
    //     res.status(400).send("Bad request"); // edit error to role authentication error
    // }

    res.status(201).json({ course: result });
  } catch (error) {
    console.log(error);
    res.status(500).send(`Internal server error: ${error}`);
  }
});

//update course 
export const updateCourse = async (req, res) => {
  try {
    const { name, description } = req.body;

    const updatedCourse = await prisma.course.update({
      where: { id: req.params.id }, 
      data: {
        name,
        description,
      },
      include: {
        lessons: true,
      },
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// TODO
customCoursesRouter.patch("/update/:id", updateCourse); 

// callback function for delete a COURSE
export const deleteCourse = async (req, res) => {
  // Your route handling code here

  try {
    console.log("Delete route handler invoked");

    const { customCourseId } = req.body;

    if (customCourseId == null) {
      return res.status(400).json({ error: "Course id is required" });
    }

    // check if the lesson with the specified id exists before trying to delete it
    const existingCourse = await prisma.course.findUnique({
      where: { id: customCourseId },
    });

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    // if found delete the lesson
    await prisma.course.delete({
      where: { id: customCourseId },
    });

    res.json({ message: "Course deleted succesfully" });
  } catch (error) {
    console.error("Error deleting course", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// delete a course
customCoursesRouter.delete("/delete/", deleteCourse);


export async function searchCourses(req,res) {
  try {
    // Get search criteria from query parameters
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Missing search keyword" });
    }

    // Perform a case-insensitive search for lessons based on the keyword
    const lessons = await prisma.course.findMany({ 
      where: {
        OR: [
          { name: { contains: String(keyword) } },
          { description: { contains: String(keyword) } },
        ],
      },
    });

    res.json(lessons); // returns the lesson entity in json format in the terminal
  } catch (error) {
    console.error("Error searching for courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// search for a course
customCoursesRouter.get("/search", searchCourses);

export default customCoursesRouter;
