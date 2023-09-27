import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { generateUuid62 } from "../../utils/uuid";
import { db } from "../../database/firebase";
import { QuestionMatching, QuestionMcq, QuestionType } from "./question";
import { Quiz, QuizOptions, QuizStatus } from "./quiz";
import { Gesture } from "@prisma/client";
import { prisma } from "../../database/prisma";

const gestureArr: Gesture[] = [
  { phrase: "a", topicId: "1", id: "1", verified: true },
  { phrase: "b", topicId: "1", id: "2", verified: true },
  { phrase: "c", topicId: "1", id: "3", verified: true },
  { phrase: "d", topicId: "1", id: "4", verified: true },
  { phrase: "e", topicId: "1", id: "5", verified: true },
];

export class QuizGenerator {
  static async create(
    userId: string,
    topic: string,
    options: QuizOptions = { length: 3 }
  ): Promise<Quiz> {
    const questions = [];

    for (let i = 0; i < options.length; i++) {
      // generate random question type
      const questionType = "mcq"; //Math.random() > 0.3 ? "mcq" : "matching"; // 70% will be mcq, 30% will be matching

      const question = await QuizGenerator.generateQuestion(
        topic,
        questionType
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

    try {
      const ref = await db.collection("quizzes").add(quizData);
      return { id: ref.id, ...quizData };
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }

  private static async generateQuestion(
    topic: string,
    type: QuestionType = "mcq"
  ): Promise<QuestionMcq | QuestionMatching> {
    // query for  gesture that is related to topic
    const gestureList = await prisma.gesture.findMany({
      where: { topicId: topic },
    });
    console.log(gestureList);
    if (type === "mcq") {
      const gesture = gestureList.filter((g) => g.topicId === topic)[
        Math.floor(Math.random() * gestureArr.length)
      ];

      const choices = gestureList
        .filter((g) => g.id !== gesture.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((g) => g.phrase);
      const mediaAnswer = await prisma.gestureMedia.findFirst({
        where: { gestureId: gesture.id },
      });

      return {
        id: generateUuid62(),
        type: "mcq",
        mediaRef: mediaAnswer.mediaRef,
        answer: gesture.phrase,
        choices: [...choices, gesture.phrase].sort(() => 0.5 - Math.random()),
      };
    } else if (type === "matching") {
      const questionId = generateUuid62();
      const gestures = gestureList.sort(() => 0.5 - Math.random()).slice(0, 5); // take first 5 gestures
      const media = await prisma.gestureMedia.findMany({
        where: {
          OR: gestures.map((g) => {
            return { gestureId: g.id };
          }),
        },
      });

      // creating answers for matching question
      const options: { answer: string; mediaRef: string }[] = gestures.map(
        (g) => {
          return {
            answer: g.phrase,
            mediaRef: media.filter((m) => {
              m.gestureId == g.id;
            })[0].mediaRef,
          };
        }
      );

      console.log(options);

      const question: QuestionMatching = {
        id: questionId,
        type: "matching",
        gestures: options,
      };

      return question;
    }
  }
}

const TEST_TOPICS = ["greetings", "farewells", "business", "shopping"];
