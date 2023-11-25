import { generateUuid62 } from "../../utils/uuid";
import { db } from "../../database/firebase";
import {
  Question,
  QuestionMatching,
  QuestionMcq,
  QuestionType,
} from "./question";
import { Quiz, QuizOptions, QuizStatus } from "./quiz";
import prisma from "../../database/prisma";
import { getGestureMediaRef } from "../../utils/getMediaRef";
import { HttpError } from "../errors/authenticationError";

export class QuizGenerator {
  /**
   *  Creates a quiz based on the topic and options
   *
   * @param {string} userId user who requested the quiz
   * @param {string} topic topic for the quiz
   * @param {QuizOptions} options (optional) parameters that modifies how the quiz is generated, by default it will generate a quiz with 3 questions when no options are provided
   * @returns {Quiz | undefined} generated quiz data along with the quiz id
   */
  static async create(
    userId: string,
    topic: string,
    options: QuizOptions = { length: 5 }
  ): Promise<Quiz | undefined> {
    const questions = [];
    if (options.length <= 0) {
      throw new HttpError(
        500,
        "Quiz length cannot be less than or equal than 0"
      );
    }
    try {
      for (let i = 0; i < options.length; i++) {
        // generate random question type
        const questionType = Math.random() > 0.3 ? "mcq" : "matching"; // 70% will be mcq, 30% will be matching

        const question = await QuizGenerator.generateQuestion(
          topic,
          questionType,
          questions
        );
        questions.push(question);
      }
      const quizData = {
        dateCreated: Date.now(),
        status: QuizStatus.INCOMPLETE,
        userId: userId,
        topic: topic,
        questions: questions,
        quizResults: [],
      };

      const ref = await db.collection("quizzes").add(quizData);
      return { id: ref.id, ...quizData };
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }

  /**
   * Generates a question based on the topic and type
   *
   * @param {string} topic topic of question should be generated
   * @param {QuestionType} type question type that is being generated
   * @param {Question[]} existingQuestions gestures that are already used in the quiz, prevents repeating questions with different options (used only in mcq questions)
   * @returns {Question} a mcq or matching question
   */
  private static async generateQuestion(
    topic: string,
    type: QuestionType = "mcq",
    existingQuestions: Question[]
  ): Promise<QuestionMcq | QuestionMatching> {
    // query for  gesture that is related to topic
    const gestureList = await prisma.gesture.findMany({
      where: { topicId: topic, verified: true },
    });
    if (gestureList.length === 0) {
      throw new HttpError(500, "No Gestures found with topicId: " + topic);
    } else if (gestureList.length < 5) {
      throw new HttpError(500, "Not enough gestures to generate question");
    }

    const existingQuestionIds = existingQuestions.map((q) => q.id);
    if (type === "mcq") {
      const gesture = gestureList.filter(
        (g) =>
          g.topicId === topic &&
          g.verified === true &&
          existingQuestionIds.includes(g.id) === false
      )[Math.floor(Math.random() * gestureList.length)];

      const choices = gestureList
        .filter((g) => g.id !== gesture.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((g) => g.phrase);

      const mediaAnswer = await getGestureMediaRef(gesture.id);

      return {
        id: generateUuid62(),
        type: "mcq",
        mediaRef: mediaAnswer.mediaRef,
        answerId: gesture.id,
        answer: gesture.phrase,
        choices: [...choices, gesture.phrase].sort(() => 0.5 - Math.random()),
      };
    } else if (type === "matching") {
      const questionId = generateUuid62();
      const gestures = gestureList.sort(() => 0.5 - Math.random()).slice(0, 5); // take first 5 gestures
      const media = await prisma.gestureMedia.findMany({
        where: {
          gestureId: { in: gestures.map((g) => g.id) },
        },
      });

      const options: { answer: string; mediaRef: string }[] = [];

      gestures.forEach((g) => {
        const mediaRef = media.filter((m) => m.gestureId === g.id)[0].mediaRef;
        options.push({ answer: g.phrase, mediaRef: mediaRef });
      });

      const question: QuestionMatching = {
        id: questionId,
        type: "matching",
        gestures: options,
      };

      return question;
    }
  }
}
