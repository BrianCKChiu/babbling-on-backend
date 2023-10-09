const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const selfAssessmentRouter = express.Router();

selfAssessmentRouter.post('/start-assessment', async (req, res) => {
  try {
    const { userId, isPractice } = req.body;

    const newAssessment = await prisma.selfAssessment.create({
      data: {
        dateTaken: new Date(),
        isPractice: isPractice,
        userId: userId,
      },
    });

    return res.status(201).json(newAssessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

selfAssessmentRouter.put('/end-assessment/:assessmentId', async (req, res) => {
  try {
    const { score } = req.body;
    const { assessmentId } = req.params;

    const updatedAssessment = await prisma.selfAssessment.update({
      where: {
        assessmentId: parseInt(assessmentId, 10),
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

export default selfAssessmentRouter;
