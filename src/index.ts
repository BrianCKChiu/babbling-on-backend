import express from "express";
import quizRouter from "./routers/quizRouter";
import bodyParser from "body-parser";

const app = express();
const port = 8080;

app.use(bodyParser.json());

app.use("/quiz", quizRouter);

app.listen(port, () => {
  return console.log(
    `Babbling On API is listening at http://localhost:${port}`
  );
});
