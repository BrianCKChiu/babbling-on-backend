import express from "express";
import { db } from "../database/firebase";

const customCoursesRouter = express.Router();

// listens for HTTP requests and displays the course information
customCoursesRouter.get("/get", async (req, res) => {
    try{

        // test
        console.log(req.body);
        res.send('This is the response for GET /get');

    } catch (error) {
        res.status(500).send(`Internal server error: ${error}`);
    }
});

// listens for HTTP requests and sends course info to server 
customCoursesRouter.post("/post", async (req, res) => {
    try{

        // test 
        console.log(req.body);

        const {
            userId,
            courseId,
            name,
            description,
            lessons,
        }: {userId: string; courseId: string, name: string; description: string, lessons: {userId:string}[]} = req.body;
        
        // authenticate user
        if (userId == null) {
            res.status(400).send("Bad request");
          }

        // verify the userId has a role of tutor or teacher
        // if (userId !== tutor || teacher) {
        //     res.status(400).send("Bad request"); // edit error to role authentication error
        // }
          
        // after post request test
        console.log(req.body)
    } catch (error) {
        res.status(500).send(`Internal server error: ${error}`);
    }
});

export default customCoursesRouter;
