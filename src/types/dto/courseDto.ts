import { LessonListDto } from "./lessonDto";

export class CourseListDto {
  id: string;
  name: string;
  description: string;
  topic: string;
  owner: string;
  totalLessons: number;
  // totalQuizzes: number;
}

export type CourseDto = {
  id: string;
  name: string;
  description: string;
  topic: string;
  owner: string;
  lessons: LessonListDto[];
  // quizzes: QuizDto[];
};
