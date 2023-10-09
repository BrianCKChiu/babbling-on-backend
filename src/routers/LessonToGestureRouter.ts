// import express from 'express'
// import { prisma } from '../database/prisma';

// const lessonToGestureRouter =  express.Router()

// lessonToGestureRouter.post("/post", async (req, res) => {
//     try {
//        const { lessonId,gestureId } = req.body;
    
//       const result = await prisma.gestureToLesson.create({
//         data: {
      
//           lessonId,
//           gestureId
//         },
//         include: {
//         // i dont think i need a course table here since it's only
//         // associated to a lesson
//         lesson:true
//         },
//       });

//       res.status(201).json(result);
//     } catch (error) {
//       console.error("Error creating lesson:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });

// export default lessonToGestureRouter 