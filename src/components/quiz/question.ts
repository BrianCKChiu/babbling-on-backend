export type QuestionType = "mcq" | "matching";

export type Question = {
  id: string;
  type: QuestionType;
};

export interface QuestionMcq extends Question {
  type: "mcq";
  gesture: GestureRef;
  choices: Array<string>;
}

export interface QuestionMatching extends Question {
  type: "matching";
  gestures: GestureRef[];
}

export type QuestionResult = {
  questionId: string;
  answer: string;
  correct: boolean;
};

export type GestureRef = {
  gestureId: string;
  mediaRef: string;
};
