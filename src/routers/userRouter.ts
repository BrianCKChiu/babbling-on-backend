import { authenticateUser } from "../auth/authenticateUser";
import { prisma } from "../database/prisma";
import express from "express";

const userRouter = express.Router();

userRouter.post("/signUp", async (req, res) => {
  try {
    const {
      email,
      uid,
      role,
      token,
    }: { email: string; uid: string; role: string; token: string } = req.body;

    await authenticateUser(token);

    await prisma.user.create({
      data: {
        email: email,
        userId: uid,
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
      where: { userId: user.uid },
    });
    if (userData == null) {
      await prisma.user.create({
        data: {
          email: user.email,
          userId: user.uid,
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
      where: { userId: userId },
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
      where: { userId: userId },
    });

    return res.status(200).json(deletedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default userRouter;
