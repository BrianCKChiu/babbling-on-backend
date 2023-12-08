import { QuizGenerator } from "../quizGenerator";

const testUser = {
  uid: "123",
  email: "test@gmail.com",
  password: "Password123",
};

describe("Quiz Generation Tests", () => {
  it("Generates a quiz with 3 questions", async () => {
    const quiz = await QuizGenerator.create("123", "1", { quizLength: 3 });

    expect(quiz.questions.length).toBe(3);
    expect(quiz.userId).toBe(testUser.uid);
    expect(quiz.status).toBe("incomplete");
  });

  it("throws a HTTP error when generating a quiz with 0 question", () => {
    expect(async () => {
      await QuizGenerator.create("123", "1", { quizLength: 0 });
    }).rejects.toThrow("Quiz length cannot be less than or equal than 0");
  });

  it("throws a HTTP error when generating a quiz with negative length quiz length", () => {
    expect(async () => {
      await QuizGenerator.create("123", "1", { quizLength: -1 });
    }).rejects.toThrow("Quiz length cannot be less than or equal than 0");
  });

  describe("Question Generation", () => {
    it("Generates a MCQ Question", async () => {
      const mcqQuestion = await QuizGenerator["generateQuestion"](
        "1",
        "mcq",
        []
      );
      if (mcqQuestion.type == "mcq") {
        expect(mcqQuestion.choices.length).toBe(4);
        expect(mcqQuestion.id).not.toBeNull();
        expect(mcqQuestion.mediaRef).not.toBeNull();
        expect(mcqQuestion.answerId).not.toBeNull();
        expect(mcqQuestion.answer).not.toBeNull();
      } else {
        fail("it did not create a MCQ object");
      }
    });

    it("Generates a Matching Question", async () => {
      const matchingQuestion = await QuizGenerator["generateQuestion"](
        "1",
        "matching",
        []
      );
      if (matchingQuestion.type == "matching") {
        expect(matchingQuestion.gestures.length).toBe(5);
        expect(matchingQuestion.id).not.toBeNull();
      } else {
        fail("it did not create a Matching Question object");
      }
    });

    it("Throws an error when no gestures found on invalid topic id", async () => {
      expect(async () => {
        await QuizGenerator["generateQuestion"]("-11111", "mcq", []);
      }).rejects.toThrow("No Gestures found with topicId: -11111");
    });
  });
});
