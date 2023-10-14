import express from "express";
import { prisma } from "../database/prisma";
import { Request, Response } from "express";
import { authenticateUser } from "../auth/authenticateUser";
const customCoursesRouter = express.Router();

customCoursesRouter.post("/all", async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    await authenticateUser(token);
    const customCourses = await prisma.course.findMany();

    res.status(200).json({ courses: customCourses });
  } catch (e) {
    res.status(500).send(`Internal server error: ${e}`);
  }
});

customCoursesRouter.post("/myCourses", async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const user = await authenticateUser(token);
    const userCourses = await prisma.course.findMany({
      where: { ownerId: user.uid },
    });

    res.status(200).json({ courses: userCourses });
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
