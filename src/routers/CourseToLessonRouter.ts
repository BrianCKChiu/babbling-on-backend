import express from 'express'
import { prisma } from '../database/prisma';

const courseTolessonRouter =  express.Router()

courseTolessonRouter.post("/post", async (req, res) => {
    try {
       const { courseId,lessonId } = req.body;
    
      const result = await prisma.lessonToCourse.create({
        data: {
        
          courseId,
          lessonId
        },
        include: {
          
        course:true,
        lesson:true
        },
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating lesson:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });





export default courseTolessonRouter