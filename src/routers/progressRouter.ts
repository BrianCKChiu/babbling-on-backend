import express from "express";
import prisma from "../database/prisma";
import { Request, Response } from "express";
import { authenticateUser } from "../auth/authenticateUser";
const progressRouter = express.Router();

progressRouter.post("/startedACourse");


progressRouter.post("/startedALesson", async (req, res) => {
    // authentication
    const { token } = req.body;
    console.log(token);
    const user = await authenticateUser(token);

    if (user == null) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    // user has clicked on a lesson and now we have to "Start the lesson"
    // ie, identify the lesson started and add the lesson to the started lesson list
    try {
        const { courseId, lessonId, currentIndex, gestureId } = req.body;

        // check if the lesson exists
        const lesson = await prisma.startedLesson.findFirst({
            where : {
                AND: [
                    {lessonId: lessonId as string}, // makes sure its the lesson we're seeing
                    {userId: user.id} // makes sure this is the use that is logged in
                ]
            }
        });
        if (!lesson) {
            return res.status(404).json({ error: "Lesson does not exist" });
        }
        // check if the gesture exists
        const gesture = await prisma.gesture.findUnique({
            where: {
                id: gestureId,
            },
        });
        if (!gesture) {
            return res.status(404).json({ error: "Gesture does not exist" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


progressRouter.post("/startedAGesture");