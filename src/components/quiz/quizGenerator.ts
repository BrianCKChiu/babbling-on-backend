import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { generateUuid62 } from "../../utils/uuid";
import { db } from "../../database/firebase";
import { QuestionMatching, QuestionMcq, QuestionType } from "./question";
import { Quiz, QuizOptions, QuizStatus } from "./quiz";

export class QuizGenerator {
  static async create(
    userId: string,
    topic?: string,
    options: QuizOptions = { length: 5 }
  ): Promise<Quiz> {
    const quizId = generateUuid62();
    const questions = [];
    if (topic == null) {
      // query for random topic
      const topics = TEST_TOPICS; // test query results
      topic = topics[Math.floor(Math.random() * topics.length)]; // choose random topic
    }
    console.log(options);
    for (let i = 0; i < options.length; i++) {
      // generate random question type
      const questionType = Math.random() > 0.3 ? "mcq" : "matching"; // 70% will be mcq, 30% will be matching

      const question = QuizGenerator.generateQuestion(topic, questionType);
      questions.push(question);
    }

    const quizData = {
      dateCreated: Date.now(),
      quizStatus: QuizStatus.INCOMPLETE,
      userId: "333333",
      topic: topic,
      questions: questions,
    };

    console.log(quizData);

    try {
      await setDoc(doc(db, "quizzes", quizId), quizData);
      return { id: quizId, ...quizData };
    } catch (e) {
      console.log(e);
    }
    return undefined;
  }

  private static generateQuestion(
    topic: string,
    type: QuestionType = "mcq"
  ): QuestionMcq | QuestionMatching {
    // query for  gesture that is related to topic
    const TEMP_QUERY_RESULTS = new Array(10);

    if (type === "mcq") {
      const phrase =
        TEMP_QUERY_RESULTS[
          Math.floor(Math.random() * TEMP_QUERY_RESULTS.length)
        ];
      const questionId = generateUuid62();

      // query for media that is associated with phrase
      // condition, media type is either image or video
      // const mediaResult = new Array(5); // test query results
      // const media = mediaResult[Math.floor(Math.random() * mediaResult.length)]; // choose random media

      return {
        id: questionId,
        type: "mcq",
        gesture: { gestureId: "asdasd", mediaRef: "asdsa" },
        choices: ["", "", "", ""], // todo: take the remaining 3 gestures queried and add them to choices
      };
    } else if (type === "matching") {
      const questionId = generateUuid62();
      const gestures = TEMP_QUERY_RESULTS.slice(0, 5); // take first 5 gestures

      // query for media that is associated with gesture
      // type GestureMedia[]
      const media = gestures.map((gesture) => {
        // condition, media type is either image
        const mediaResult = new Array(5); // test query results
        return mediaResult[Math.floor(Math.random() * 5)]; // choose random media
      });
      const question: QuestionMatching = {
        id: questionId,
        type: "matching",
        gestures: [
          {
            gestureId: "asdasd", // gesture.id,
            mediaRef: "asdas", //media[index].id,
          },
          {
            gestureId: "asdasd", // gesture.id,
            mediaRef: "asdas", //media[index].id,
          },
        ],
      };

      console.log(question);
      return question;
    }
  }
}

const TEST_TOPICS = ["greetings", "farewells", "business", "shopping"];
