export type QuestionType = "mcq" | "matching";

export type Question = {
  id: string;
  type: QuestionType;
};

export interface QuestionMcq extends Question {
  type: "mcq";
  gesture: { gestureId: string; mediaRef: string };
  choices: Array<string>;
}

export interface QuestionMatching extends Question {
  type: "matching";
  gestures: { gestureId: string; mediaRef: string }[];
}
