import express from 'express'
import { prisma } from '../database/prisma';


const gestureRouter =  express.Router()

// create a gesture
gestureRouter.post("/post", async (req, res) => {
    try {
        
        console.log("enters post method in gesture router");

       const { gestureId,lessonId,phrase,verified,topicId } = req.body;
    
      const result = await prisma.gesture.create({
        data: {
          lessonId,
          phrase,
          verified,
          topicId,
        },
        include: {
        },
      });
  
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating gesture:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


//get signs
gestureRouter.get("/get", async (req, res) => {
    try {
      const gestures = await prisma.lesson.findMany({
        include: {
        },
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


// update sign 
gestureRouter.patch('/update/:id',async(req,res)=>{
  try {
      const { name, description } = req.body;
  
      const updatedGesture = await prisma.lesson.update({
        where: { id: req.params.id},
        data: {
          name,
          description,
        },
        include: {
        },
      });
  
      res.json(updatedGesture);
    } catch (error) {
      console.error("Error updating gesture:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
})

// delete gesture
gestureRouter.delete('/delete/', async(req, res) => {
    try {
      console.log('Delete route handler invoked');
      
      const {gestureId} = req.body;

      if (gestureId == null){
        return res.status(400).json({error: "Gesture id is required"});
      }

      // check if the lesson with the specified id exists before trying to delete it
      const existingGesture = await prisma.gesture.findUnique({
        where: { id: gestureId },
      });

      if (!existingGesture){
        return res.status(404).json({ error: 'Gesture not found' });
      }

      // if found delete the lesson
      await prisma.gesture.delete({
        where: { id: gestureId },
      });

      res.json({ message: 'Gesture deleted succesfully' });
    }catch(error){
      console.error('Error deleting gesture', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});


// search for a gesture
gestureRouter.get('/search', async (req, res) => {
  try {
    // Get search criteria from query parameters
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Missing search keyword' });
    }

    // Perform a case-insensitive search for lessons based on the keyword
    const lessons = await prisma.lesson.findMany({
      where: {
        OR: [
          { name: { contains: String(keyword)} },
          { description: { contains: String(keyword)} },
        ],
      },
    });

    res.json(lessons); // returns the lesson entity in json format in the terminal
  } catch (error) {
    console.error('Error searching for gestures:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default gestureRouter