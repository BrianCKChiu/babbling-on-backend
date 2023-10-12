import { authenticateToken } from "../auth/authenticateToken";
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
    console.log("bb");

    if (token == null) {
      return res.status(400).send("Bad request");
    }
    const user = await authenticateToken(token);
    if (user == null) {
      return res.status(401).send("Unauthorized");
    }

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
    return res.status(500).json({ error: "Internal Server Error" });
  }
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
