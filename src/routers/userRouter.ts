import { authenticateUser } from "../auth/authenticateUser";
import prisma from "../database/prisma";
import express from "express";

const userRouter = express.Router();

userRouter.post("/startCourse", async (req, res) => {
  try {
    // authentication
    const { token } = req.body;
    console.log(token);
    const user = await authenticateUser(token);

    if (user == null) {
      return res.status(401).json({ error: "Not Authenticated" });
    }

    // start a course, 

    // receive course id, lesson id and current index of the lesson and gesture id 
    // search started course list to find the one that has the same course and user id

    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// started Courses 
userRouter.post("/startedCourses", async (req, res) => {
  try {
    // authentication
    const { token } = req.body;
    console.log(token);
    const user = await authenticateUser(token);

    if (user == null) {
      return res.status(401).json({ error: "Not Authenticated" });
    }



    // check if the started gesture exist and started lesson
  
    // and check started course if it exists

    // if the started course does exist, then we're going to use the existing started course and check if the 
    // gesture and lesson also exist and if they do we're gonna use the existing gesture and lesson

    // LESSON - user will go to either first gesture or their current gesture 
    // use gesture id to search in started gestures list, if it exists 

    // get all courses that the user has started, user starts course when they click on lesson
    // receive course id and also lesson id and gesture id 

    // 1. create started gesture 
    // 2. create started lesson
    // 3. create started course 

    // 4. push started gesture to lesson's started gesture array and add the started lesson to the course's 
    // started lessons array 
    
    // 5. push started course to user's started courses array
    


    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

userRouter.post("/signUp", async (req, res) => {
  try {
    const {
      email,
      uid,
      role,
      token,
    }: { email: string; uid: string; role: string; token: string } = req.body;

    console.log(token);
    // await authenticateUser(token);

    await prisma.user.create({
      data: {
        email: email,
        id: uid,
        role: role.toUpperCase(),
      },
    });

    return res.status(201);
  } catch (error) {
    console.error(error);
    // Preventing Duplicate Emails
    if (error.code === "P2002" && error.meta.target.includes("email")) {
      return res.status(400).json({ error: "Email already in use" });
    }
    return res.status(500).json({ error: `Internal Server Error: {e}` });
  }
});

userRouter.post("/", async (req, res) => {
  try {
    const { token } = req.body;
    console.log(token);

    const user = await authenticateUser(token);
    const userData = await prisma.user.findUnique({
      where: { id: user.uid },
    });
    if (userData == null) {
      await prisma.user.create({
        data: {
          email: user.email,
          id: user.uid,
          role: "PROFESSOR",
        },
      });
      console.log(userData);

      return res.status(200).json({ message: "user created" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  return res.status(200).json({ message: "ok" });
});

userRouter.put("/update-email/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: email },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    // Preventing Duplicate Emails
    if (error.code === "P2002" && error.meta.target.includes("email")) {
      return res.status(400).json({ error: "Email already in use" });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

userRouter.delete("/delete-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json(deletedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

userRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

userRouter.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default userRouter;
