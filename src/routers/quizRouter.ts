import { QuizGenerator } from "../components/quiz/quizGenerator";
import { Quiz, QuizOptions, QuizStatus } from "../components/quiz/quiz";
import express from "express";
import { db } from "../database/firebase";
import { authenticateUser } from "../auth/authenticateUser";
import { HttpError } from "../components/errors/authenticationError";
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
      throw new HttpError(404, "Bad request: No quiz id was provided");
    }
    const quizDetailDoc = await db.collection("quizData").doc(quizId).get();

    const quizDetailData = quizDetailDoc.data();
    if (quizDetailData == null) {
      throw new HttpError(404, "Quiz details not found");
    }

    return res.status(200).json(quizDetailData);
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      error.log();
      return res.status(error.statusCode).json({ message: error.message });
    }
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
    const {
      token,
      topic,
      options,
    }: { token: string; topic: string; options: QuizOptions } = req.body;
    if (token == null) {
      throw new HttpError(400, "Bad request: No quiz id was provided");
    }
    // authenticate user
    const user = await authenticateUser(token);
    if (user == null) {
      throw new HttpError(401, "Unauthorized");
    }
    const quizData = await QuizGenerator.create(user.uid, topic);

    return res.status(200).json(quizData);
  } catch (error) {
    if (error instanceof HttpError) {
      error.log();
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: `Internal server error: ${error}` });
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
    if (token == null || quizId == null || results == null) {
      throw new HttpError(400, "Bad request: No quiz id was provided");
    }
    // authenticate user
    const user = await await authenticateUser(token);
    if (user == null) {
      throw new HttpError(400, "Unauthorized");
    }
    // verify quizId belongs to userId
    const quizDoc = await db.collection("quizzes").doc(quizId).get();

    const quizData = quizDoc.data();
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
    if (error instanceof HttpError) {
      error.log();
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: `Internal server error: ${error}` });
  }
});

export default quizRouter;
