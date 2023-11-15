import { QuizGenerator } from "../components/quiz/quizGenerator";
import { Quiz, QuizOptions, QuizStatus } from "../components/quiz/quiz";
import express from "express";
import { db } from "../database/firebase";
import { authenticateUser } from "../auth/authenticateUser";

const quizRouter = express.Router();

/**
 * gets details for a quiz
 * @param {string} quizId id of the quiz
 * @param {string} token user's token
 *
 * @returns {Response} 200 response code with quiz details
 */
quizRouter.post("/details", async (req, res) => {
  try {
    const { quizId, token } = req.body;
    await authenticateUser(token);

    if (quizId == null) {
      return res.status(400).send("Bad request");
    }
    const quizDetailDoc = await db.collection("quizData").doc(quizId).get();

    const quizDetailData = quizDetailDoc.data();
    if (quizDetailData == null) {
      return res.status(404).send("Quiz not found");
    }
    return res.status(200).json(quizDetailData);
  } catch (error) {
    return res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

/**
 * Creates a quiz
 *
 * @param {string} token user's token
 * @param {string} topic topic of the quiz
 * @param {QuizOptions} options quiz options
 *
 * @returns {Response} 200 response code with quiz data and questions in the quiz
 */
quizRouter.post("/create", async (req, res) => {
  try {
    console.log(req.body);
    const {
      token,
      topic,
      options,
    }: { token: string; topic: string; options: QuizOptions } = req.body;
    if (token == null) {
      return res.status(400).send("Invalid Token");
    }
    // authenticate user
    const user = await authenticateUser(token);
    if (user == null) {
      return res.status(401).send("Unauthorized");
    }
    const quizData = await QuizGenerator.create(user.uid, topic);

    console.log(quizData);
    return res.status(200).json(quizData);
  } catch (error) {
    return res.status(500).send(`Internal server error: ${error}`);
  }
});

/**
 * Updates the quiz Results
 *
 * @param {string} token user's token
 * @param {string} quizId id of the quiz
 * @param {QuestionResult[]} results quiz results
 *
 * @returns {Response}
 */
quizRouter.post("/submitAnswer", async (req, res) => {
  try {
    const { token, quizId, results } = req.body;
    console.log(req.body);
    if (token == null || quizId == null || results == null) {
      return res.status(400).send("Bad request");
    }
    // authenticate user
    const user = await await authenticateUser(token);
    if (user == null) {
      return res.status(401).send("Unauthorized");
    }
    console.log(quizId);
    // verify quizId belongs to userId
    const quizDoc = await db.collection("quizzes").doc(quizId).get();

    const quizData = quizDoc.data();
    console.log(quizData);
    if (quizData == null) {
      return res.status(401).send(`Quiz not found: ${quizId}`);
    }
    if (quizData.userId != user.uid) {
      return res.status(401).send(`Quiz does not belong to user: ${user.uid}`);
    }

    // update quiz results & status
    await quizDoc.ref.update({
      quizResults: results,
      status: QuizStatus.COMPLETED,
      timeCompleted: Date.now(),
    });

    return res.status(200);
  } catch (error) {
    return res.status(500).send(`Internal server error: ${error}`);
  }
});

export default quizRouter;
