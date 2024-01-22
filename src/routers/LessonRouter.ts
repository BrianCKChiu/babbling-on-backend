import express from "express";
import prisma from "../database/prisma"; // cant even own up that he indirectly called me crazy 

const lessonRouter = express.Router(); 

// create a lesson
lessonRouter.post("/post", async (req, res) => {
  try {
    console.log("enters post method in lesson router");
    const { courseId, name, description } = req.body;
    console.log(name, description);

    const result = await prisma.lesson.create({
      data: {
        courseId,
        name,
        description,
      },
      include: {
        // no need for includes
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

lessonRouter.post("/getLesson", async (req, res) => {
  const { lessonId } = req.body;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        gestures: true,
      },
    });
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
    } else {
      res.json(lesson);
    }
  } catch (error) {
    console.error("Error getting lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get lessons
lessonRouter.get("/get", async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {},
    });

    if (!lessons) {
      res.status(404).json({ error: "lessons not found" });
    } else {
      res.json(lessons);
    }
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update lesson

lessonRouter.patch("/update/:id", async (req, res) => {
  try {
    const { name, description } = req.body;

    const updatedLesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
      },
      include: {
        gestures: true,
      },
    });

    res.json(updatedLesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete lesson - DEBUGGING
lessonRouter.delete("/delete/", async (req, res) => {
  try {
    console.log("Delete route handler invoked");

    const { lessonId } = req.body;

    if (lessonId == null) {
      return res.status(400).json({ error: "Lesson id is required" });
    }

    // check if the lesson with the specified id exists before trying to delete it
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // if found delete the lesson
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    res.json({ message: "Lesson deleted succesfully" });
  } catch (error) {
    console.error("Error deleting lesson", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// search for a course or lesson

lessonRouter.get("/search", async (req, res) => {
  try {
    // Get search criteria from query parameters
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Missing search keyword" });
    }

    // Perform a case-insensitive search for lessons based on the keyword
    const lessons = await prisma.lesson.findMany({
      where: {
        OR: [
          { name: { contains: String(keyword) } },
          { description: { contains: String(keyword) } },
        ],
      },
    });

    res.json(lessons); // returns the lesson entity in json format in the terminal
  } catch (error) {
    console.error("Error searching for lessons:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default lessonRouter;
