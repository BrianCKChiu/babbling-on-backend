import express from "express";
import quizRouter from "./routers/quizRouter";
import customCoursesRouter from "./routers/customCoursesRouter";
import bodyParser from "body-parser";

const app = express();
const port = 8080;

app.use(bodyParser.json());

app.use("/quiz", quizRouter);
app.use("/customCourse", customCoursesRouter);

app.listen(port, () => {
  return console.log(
    `Babbling On API is listening at http://localhost:${port}`
  );
});
