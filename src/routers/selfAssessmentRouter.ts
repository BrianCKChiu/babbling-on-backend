const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const selfAssessmentRouter = express.Router();

//create the assessment
selfAssessmentRouter.post('/start-assessment', async (req, res) => {
  try {
    const { userId, isPractice } = req.body;

    const newAssessment = await prisma.selfAssessment.create({
      data: {
        dateTaken: new Date(),
        isPractice: isPractice, //diffrentiates between prcatice sessions and Self Assessments
        userId: userId,
        score: 0, // Initializing score to 0
      },
    });

    return res.status(201).json(newAssessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//end an assessment
selfAssessmentRouter.put('/end-assessment/:assessmentId', async (req, res) => {
  try {
    const { score } = req.body;
    const { assessmentId } = req.params;

    const updatedAssessment = await prisma.selfAssessment.update({
      where: {
        assessmentId: assessmentId, 
      },
      data: {
        score: score,
      },
    });

    return res.status(200).json(updatedAssessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get ALL assessments for a user including practice
selfAssessmentRouter.get('/assessments/all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await prisma.selfAssessment.findMany({
      where: { userId: userId },
    });
    if (assessments.length > 0) {
      return res.status(200).json(assessments);
    } else {
      return res.status(404).json({ message: 'No assessments found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get only self assessments for a user 
selfAssessmentRouter.get('/assessments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await prisma.selfAssessment.findMany({
      where: { 
        userId: userId,
        isPractice: false // only self assessments will be chosen
      },
    });

    if (assessments.length > 0) {
      return res.status(200).json(assessments);
    } else {
      return res.status(404).json({ message: 'No assessments found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// get average score for a user 
selfAssessmentRouter.get('/average-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await prisma.selfAssessment.findMany({
      where: { 
        userId: userId,
        isPractice: false
      },
    });

    if (assessments.length === 0) {
      return res.status(404).json({ message: 'No assessments found' });
    }

    const totalScore = assessments.reduce((acc, assessment) => acc + assessment.score, 0);
    const averageScore = totalScore / assessments.length;

    return res.status(200).json({ averageScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//get highest score for a user
selfAssessmentRouter.get('/highest-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessments = await prisma.selfAssessment.findMany({
      where: { userId: userId, isPractice: false },
      orderBy: { score: 'desc' },
      take: 1,
    });

    const highestScore = assessments[0]?.score || 0;
    
    return res.status(200).json({ highestScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//delete a specific assessment
selfAssessmentRouter.delete('/assessment/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const deletedAssessment = await prisma.selfAssessment.delete({
      where: { assessmentId: assessmentId },
    });
    return res.status(200).json(deletedAssessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//get a specific assessment
selfAssessmentRouter.get('/assessment/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await prisma.selfAssessment.findUnique({
      where: { assessmentId: assessmentId },
    });
    if (assessment) {
      return res.status(200).json(assessment);
    } else {
      return res.status(404).json({ error: 'Assessment not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



export default selfAssessmentRouter;
