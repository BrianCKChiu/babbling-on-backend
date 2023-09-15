import { QuizGenerator } from "../components/quiz/quizGenerator";
import { QuizOptions } from "../components/quiz/quiz";
import express from "express";

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

export default quizRouter;
