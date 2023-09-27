import { QuizGenerator } from "../components/quiz/quizGenerator";
import { Quiz, QuizOptions, QuizStatus } from "../components/quiz/quiz";
import express from "express";
import { db } from "../database/firebase";
import { authenticateToken } from "../utils/authenticateToken";

const quizRouter = express.Router();

quizRouter.post("/create", async (req, res) => {
  try {
    console.log(req.body);
    const {
      token,
      topic,
      options,
    }: { token: string; topic: string; options: QuizOptions } = req.body;
    if (token == null) {
      return res.status(400).send("Bad request");
    }
    // authenticate user
    // const user = await authenticateToken(token);
    // if (user == null) {
    //   return res.status(401).send("Unauthorized");
    // }
    const quizData = await QuizGenerator.create(token, topic);

    console.log(quizData);
    return res.status(200).json(quizData);
  } catch (error) {
    return res.status(500).send(`Internal server error: ${error}`);
  }
});

quizRouter.post("/submitAnswer", async (req, res) => {
  try {
    const { token, quizId, answer } = req.body;
    if (token == null || quizId == null || answer == null) {
      res.status(400).send("Bad request");
    }
    // authenticate user
    const user = await authenticateToken(token);
    if (user == null) {
      res.status(401).send("Unauthorized");
    }
    // verify quizId belongs to userId
    const quizDoc = await db.collection("quizzes").doc(quizId).get();
    const quizData = quizDoc.data();
    if (quizData == null) {
      res.status(401).send(`Quiz not found: ${quizId}`);
    }
    if (quizData.userId != token) {
      res.status(401).send(`Quiz does not belong to user: ${user.uid}`);
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
