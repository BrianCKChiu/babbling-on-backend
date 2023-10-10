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
    // Preventing Duplicate Emails
    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

userRouter.put('/update-email/:userId', async (req, res) => {
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
      if (error.code === 'P2002' && error.meta.target.includes('email')) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  userRouter.delete('/delete-user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
  
      const deletedUser = await prisma.user.delete({
        where: { userId: userId },
      });
  
      return res.status(200).json(deletedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

userRouter.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({ where: { userId: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

userRouter.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

  

export default userRouter;
