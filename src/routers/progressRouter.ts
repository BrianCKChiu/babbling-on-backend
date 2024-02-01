import express from "express";
import prisma from "../database/prisma";
import { Request, Response } from "express";
import { authenticateUser } from "../auth/authenticateUser";
import lessonRouter from "./LessonRouter";
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
    let startedGestureId;

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
            include: {
                user: true,
                startedLessons: true,
            }
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
                    courseId,
                    startedLessonId,
                },
                include: {
                    lesson: true,
                },
            });

            return res.status(200).json("started a course lesson and a sign");
        } else {
            // COURSE DOES EXIST

            // check if the lesson exists
            const lesson = await prisma.startedLesson.findFirst({
            where : {
                AND: [
                    {lessonId: lessonId as string}, // makes sure its the lesson we're seeing
                    {userId: user.id} // makes sure this is the use that is logged in
                    ]
                },
                include: {
                    course: true,
                    startedGestures: true,
                }
            });

            // LESSON DOESN'T EXIST
            // make a lesson and add it to the existing course's startedLesson list
            // ie. the user has started this course (and one lesson) but not this one  
            if (!lesson) {
                const lessonResult = await prisma.startedLesson.create({
                    data: {
                        courseId,
                        lessonId, // find with this
                        userId: user.id, // find with this as well if you gotta use it
                        maxReachedGesture: 0,
                        startedCourseId: course.id,
                    },
                    include: {
                        course: true,
                        startedGestures: true,
                    },
                });

                // EDIT
                // add the lesson to the startedLessons list
                course.startedLessons.push(lesson);

                startedLessonId = lessonResult.id;

                // if the lesson doesn't exist remember the gesture DOESN'T EXIST EITHER

                // create a new gesture
                const gestureResult = await prisma.startedGesture.create({
                    data: {
                        gestureId,
                        lessonId,
                        userId: user.id,
                        courseId,
                        startedLessonId,
                    },
                    include: {
                        lesson: true,
                    },
                });

                // add the new gesture to the list of started gestures
                // lessonResult.startedGestures.push(gestureResult);
                console.log("lesson Result's startedGestures list", lessonResult.startedGestures);

                return res.status(200).json("started a lesson and a gesture");
            } else {
            // lesson DOES exist
            // ie. user has started this course and this lesson so now move onto gesture 
            
            const realLesson = await prisma.lesson.findFirst({
                where: {
                    id: lesson.lessonId
                    },
                    include: {
                        gestures: true,
                    }
                });

            // gesture you will return will be
            return res.status(200).json({gesture: realLesson.gestures[lesson.maxReachedGesture]});

            // check if the gesture exists
            // const gesture = await prisma.startedGesture.findFirst({
            //     where : {
            //         AND: [
            //             {gestureId: gestureId as string}, // makes sure its the gesture we're seeing
            //             {userId: user.id}, // makes sure this is the use that is logged in
            //             ]
            //         }
            //     });

            // GESTURE DOESN'T EXIST
            // ie. the user has started this course and this lesson but not this gesture
            // so make a gesture and add it to the existing lesson's startedGesture list

        //     if (!gesture){
        //         const gestureResult = await prisma.startedGesture.create({
        //             data: {
        //                 gestureId,
        //                 lessonId,
        //                 userId: user.id,
        //                 courseId,
        //                 startedLessonId: lesson.id,
        //             },
        //             include: {
        //                 lesson: true,
        //             },
        //         });

        //         // add the gesture to the startedGestures list
        //         lesson.startedGestures.push(gestureResult);

        //         return res.status(200).json("started a new gesture");
        //     } else {

        //     // YI AYUDA SHOULD I KEEP THIS HERE OR SHOULD I MOVE IT TO STARTED GESTURES

        //     // GESTURE DOES EXIST 
        //     // ie. user has started this course, this lesson and this gesture so now move onto next gesture or finish course

        //     // find the real lesson 
        //     lesson.lessonId 
        //     const realLesson = await prisma.lesson.findUnique({
        //         where: {
        //             id: lesson.lessonId,
        //         },
        //         include: {
        //             gestures: true,
        //         },
        //     });

        //     // YI AYUDA

        //     // check if the lesson is finished
        //     if (realLesson.gestures.length > lesson.startedGestures.length){
        //         // go to next gesture there's still more gestures
        //     } else {
        //         // finish lesson 

        //     }
        // }
        }
    }
            // return res.status(404).json({ error: "Lesson does not exist" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
   
});

progressRouter.post("/startedAGesture");