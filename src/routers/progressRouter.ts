import express from "express";
import prisma from "../database/prisma";
import { Request, Response } from "express";
import { authenticateUser } from "../auth/authenticateUser";
const progressRouter = express.Router();

progressRouter.post("/startedALesson", async (req, res) => {
    // authentication
    const { token } = req.body;
    console.log(token);
    const user = await authenticateUser(token);

    if (user == null) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    let startedCourseId;
    let startedLessonId;

    // user has clicked on a lesson and now we have to "Start the lesson"
    // ie, identify the lesson started and add the lesson to the started lesson list
    try {
        const { courseId, lessonId, currentIndex, gestureId } = req.body;

        // check if the course exists
        const course = await prisma.startedCourse.findFirst({
            where: {
                AND: [
                    {
                        courseId: courseId as string, // makes sure its the course we're seeing
                        userId: user.id, // makes sure this is the use that is logged in
                    },
                ],
            },
        });

        if (!course) {

            // create a new course
            const courseResult = await prisma.startedCourse.create({
                data: {
                    courseId,
                    userId: user.id,
                    maxReachedLesson : currentIndex,
                },
                include: {
                    user: true,
                    startedLessons: true,
                },
            });

            startedCourseId = courseResult.id;

        // check if the lesson exists
        // const lesson = await prisma.startedLesson.findFirst({
        //     where : {
        //         AND: [
        //             {lessonId: lessonId as string}, // makes sure its the lesson we're seeing
        //             {userId: user.id} // makes sure this is the use that is logged in
        //         ]
        //     }
        // });
        
            // create a new lesson
            const lessonResult = await prisma.startedLesson.create({
                data: {
                    courseId,
                    lessonId,
                    userId: user.id,
                    maxReachedGesture: 0,
                    startedCourseId,
                },
                include: {
                    course: true,
                    startedGestures: true,
                },
            });

            startedLessonId = lessonResult.id;

            // create a new gesture
            const gestureResult = await prisma.startedGesture.create({
                data: {
                    gestureId,
                    lessonId,
                    userId: user.id,
                    
                    startedLessonId,
                },
                include: {
                    lesson: true,
                },
            });
        }
            // return res.status(404).json({ error: "Lesson does not exist" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
   
});


progressRouter.post("/startedAGesture");