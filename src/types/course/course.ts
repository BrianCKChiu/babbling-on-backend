
import { Lesson } from "../lesson/lesson";

export interface Course {
  id: string;
  name: string;
  description: string;
  topidId: string;
  ownerId: string;
  lessons: Lesson[];
}
