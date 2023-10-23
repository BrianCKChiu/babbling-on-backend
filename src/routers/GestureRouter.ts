import express from "express";
import { prisma } from "../database/prisma";
import { authenticateUser } from "../auth/authenticateUser";

const gestureRouter = express.Router();

// create a gesture
gestureRouter.post("/post", async (req, res) => {
  try {
    console.log("enters post method in gesture router");

    const { token, gestureId, lessonId, phrase, verified, topicId } = req.body;
    if (token == null) {
      return res.status(400).json({ error: "Token is required" });
    }
    const user = await authenticateUser(token);

    if (user == null) {
      return res.status(400).json({ error: "Not Authenticated" });
    }
    const result = await prisma.gesture.create({
      data: {
        lessonId: lessonId,
        phrase: phrase,
        verified: verified,
        topicId: topicId,
      },
      include: {},
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating gesture:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

gestureRouter.post("/getGesture", async (req, res) => {
  const {gestureId} = req.body;

 try {
   const gesture = await prisma.gesture.findUnique({
     where: {id: gestureId},
    });
    if (!gesture) {
      res.status(404).json({ error: "Gesture not found" });
    } else {
      res.json(gesture);
    }
} catch (error) {
  console.error("Error getting gesture:", error);
 res.status(500).json({ error: "Internal Server Error" });
}
});

//get signs
gestureRouter.get("/get", async (req, res) => {
  try {
    const gestures = await prisma.gesture.findMany({
      include: {},
    });

    if (!gestures) {
      res.status(404).json({ error: "gestures not found" });
    } else {
      res.json(gestures);
    }
  } catch (error) {
    console.error("Error fetching gesture:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update sign - IN PROGRESS, MISSING "IMAGE"
gestureRouter.patch("/update/:id", async (req, res) => {
  try {
    const { phrase, topicId, mediaRef, gestureId } = req.body;

    if (mediaRef != null) {
      await prisma.gestureMedia.create({
        data: {
          mediaRef: mediaRef,
          mediaType: "IMAGE",
          gestureId: req.params.id,
        },
      });
    }

    const updatedGesture = await prisma.gesture.update({
      where: { id: req.params.id },
      data: {
        phrase,
        topicId,
      },
      include: {},
    });

    res.json(updatedGesture);
  } catch (error) {
    console.error("Error updating gesture:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete gesture
gestureRouter.delete("/delete/", async (req, res) => {
  try {
    console.log("Delete route handler invoked");

    const { gestureId } = req.body;

    if (gestureId == null) {
      return res.status(400).json({ error: "Gesture id is required" });
    }

    // check if the lesson with the specified id exists before trying to delete it
    const existingGesture = await prisma.gesture.findUnique({
      where: { id: gestureId },
    });

    if (!existingGesture) {
      return res.status(404).json({ error: "Gesture not found" });
    }

    // if found delete the lesson
    await prisma.gesture.delete({
      where: { id: gestureId },
    });

    res.json({ message: "Gesture deleted succesfully" });
  } catch (error) {
    console.error("Error deleting gesture", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// search for a gesture
gestureRouter.get("/search", async (req, res) => {
  try {
    // Get search criteria from query parameters
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Missing search keyword" });
    }

    // Perform a case-insensitive search for lessons based on the keyword
    const lessons = await prisma.gesture.findMany({
      where: {
        OR: [
          { phrase: { contains: String(keyword) } },
          { topicId: { contains: String(keyword) } },
        ],
      },
    });

    res.json(lessons); // returns the lesson entity in json format in the terminal
  } catch (error) {
    console.error("Error searching for gestures:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default gestureRouter;
