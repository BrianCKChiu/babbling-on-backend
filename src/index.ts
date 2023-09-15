import express from "express";
import quizRouter from "./routers/quizRouter";
import bodyParser from "body-parser";

const app = express();
const port = 8080;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/quiz", quizRouter);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
