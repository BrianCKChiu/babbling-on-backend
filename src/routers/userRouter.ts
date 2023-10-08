const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const userRouter = express.Router();

userRouter.post('/sign-up', async (req, res) => {
  try {
    const { email } = req.body;

    const newUser = await prisma.user.create({
      data: {
        email: email,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    // Prevent Duplicate Emails from being used
    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default userRouter;
