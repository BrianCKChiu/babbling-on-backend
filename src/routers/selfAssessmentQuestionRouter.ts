const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const selfAssessmentQuestionRouter = express.Router();

// Add a new question to a self-assessment
selfAssessmentQuestionRouter.post('/add', async (req, res) => {
  try {
    const { assessmentId, text, isCorrect, imageUrl } = req.body;

    const newQuestion = await prisma.selfAssessmentQuestion.create({
      data: {
        assessmentId: assessmentId,
        text: text,
        isCorrect: isCorrect,
        imageUrl: imageUrl
      }
    });

    return res.status(201).json(newQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all questions for a specific self-assessment
selfAssessmentQuestionRouter.get('/assessment/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const questions = await prisma.selfAssessmentQuestion.findMany({
      where: { assessmentId: assessmentId }
    });

    if (questions.length > 0) {
      return res.status(200).json(questions);
    } else {
      return res.status(404).json({ message: 'No questions found for this assessment' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default selfAssessmentQuestionRouter;
