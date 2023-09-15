import { QuizGenerator } from "../components/quiz/quizGenerator";
import { Quiz, QuizOptions, QuizStatus } from "../components/quiz/quiz";
import express from "express";
import { db } from "../database/firebase";

const quizRouter = express.Router();

quizRouter.post("/create", async (req, res) => {
  try {
    console.log(req.body);
    const {
      userId,
      topic,
      options,
    }: { userId: string; topic: string; options: QuizOptions } = req.body;
    if (userId == null) {
      res.status(400).send("Bad request");
    }
    // authenticate user

    const quizData = await QuizGenerator.create(userId, topic);

    console.log(quizData);
    res.status(200).json(quizData);
  } catch (error) {
    res.status(500).send(`Internal server error: ${error}`);
  }
});

quizRouter.post("/submitAnswer", async (req, res) => {
  try {
    const { userId, quizId, answer } = req.body;
    if (userId == null || quizId == null || answer == null) {
      res.status(400).send("Bad request");
    }
    // authenticate user

    // verify quizId belongs to userId
    const quizDoc = await db.collection("quizzes").doc(quizId).get();
    const quizData = quizDoc.data();
    if (quizData == null) {
      res.status(401).send(`Quiz not found: ${quizId}`);
    }
    if (quizData.userId != userId) {
      res.status(401).send(`Quiz does not belong to user: ${userId}`);
    }
    const results = [...quizData.quizResults, answer];

    // update quiz results & status
    if (results.length === quizData.questions.length) {
      await quizDoc.ref.update({
        quizResults: results,
        status: QuizStatus.COMPLETED,
      });
    } else {
      await quizDoc.ref.update({
        quizResults: results,
      });
    }

    res.status(200);
  } catch (error) {
    res.status(500).send(`Internal server error: ${error}`);
  }
});

export default quizRouter;
