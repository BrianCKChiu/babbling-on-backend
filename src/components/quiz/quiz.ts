import { Question } from "./question";

export type QuizOptions = {
  length?: number;
  type?: QuizType;
};
export enum QuizType {
  DAILY = "daily",
  WEEKLY = "weekly",
}
export enum QuizStatus {
  INCOMPLETE = "incomplete",
  COMPLETED = "completed",
}

export type Quiz = {
  id: string;
  dateCreated: number;
  quizStatus: QuizStatus;
  userId: string;
  topic: string;
  questions: Array<Question>;
};
