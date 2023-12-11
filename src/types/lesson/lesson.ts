import {Gesture} from "../gesture/gesture";

export interface Lesson {
    id: string;
    name: string;
    description: string;
    courseId: string;
    gestures: Gesture[];
  }