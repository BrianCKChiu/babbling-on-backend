import express from "express";
import { prisma } from "../database/prisma";
import { Request, Response } from "express";
import { authenticateUser } from "../auth/authenticateUser";
const customCoursesRouter = express.Router();

/**
 * Get all courses created by the user
 * @param {string} token user's token
 * @param {string} courseId
 * @returns {Response}
 */

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
// customCoursesRouter.get("/takenCourses", async (req: Request, res: Response) => {

// };

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

// listens for HTTP requests and displays the course information
customCoursesRouter.get("/get", async (req: Request, res: Response) => {
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

// listens for HTTP requests and sends course info to server
customCoursesRouter.post("/post", async (req: Request, res: Response) => {
  try {
    // test
    console.log(req.body);

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
    console.log(result);
    // verify the userId has a role of tutor or teacher
    // if (userId !== tutor || teacher) {
    //     res.status(400).send("Bad request"); // edit error to role authentication error
    // }

    // after post request test
    res.status(201).json({ course: result });
  } catch (error) {
    console.log(error);
    res.status(500).send(`Internal server error: ${error}`);
  }
});

//update course
customCoursesRouter.patch("/update/:id", async (req, res) => {
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

    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete a course
customCoursesRouter.delete("/delete/", async (req, res) => {
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
});

// search for a course
customCoursesRouter.get("/search", async (req, res) => {
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
});

export default customCoursesRouter;
