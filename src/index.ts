import express from "express";
import quizRouter from "./routers/quizRouter";
import customCoursesRouter from "./routers/customCoursesRouter";
import bodyParser from "body-parser";
import lessonRouter from "./routers/LessonRouter";
import gestureRouter from "./routers/GestureRouter";
import userRouter from "./routers/userRouter";

const app = express();
const port = 8080;

app.use(bodyParser.json());

app.use("/quiz", quizRouter);

app.use("/customCourses", customCoursesRouter);
app.use("/lesson", lessonRouter);

app.use("/gesture", gestureRouter);

app.use("/customCourse", customCoursesRouter);
app.use("/user", userRouter);

app.listen(port, () => {
  `Babbling On API is listening at http://localhost:${port}`;
});
