import { Question, QuestionResult } from "./question";

export type QuizOptions = {
  quizLength?: number;
  type?: "hybrid" | "mcq";
};
export enum QuizStatus {
  INCOMPLETE = "incomplete",
  COMPLETED = "completed",
}

export type Quiz = {
  id: string;
  dateCreated: number;
  status: QuizStatus;
  userId: string;
  topic: string;
  questions: Array<Question>;
  quizResults: Array<QuestionResult>;
};
