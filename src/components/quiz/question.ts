export type QuestionType = "mcq" | "matching";

export type Question = {
  id: string;
  type: QuestionType;
};

export interface QuestionMcq extends Question {
  type: "mcq";
  mediaRef: string;
  answer: string;
  choices: Array<string>;
}

export interface QuestionMatching extends Question {
  type: "matching";
  gestures: { answer: string; mediaRef: string }[];
}

export type QuestionResult = {
  questionId: string;
  answer: string;
  correct: boolean;
};

