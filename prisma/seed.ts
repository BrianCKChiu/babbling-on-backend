import { prisma } from "../src/database/prisma";

async function main() {
  // topic
  await prisma.topic.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      name: "alphabet",
    },
  });

  // gesture
  await prisma.gesture.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      phrase: "A",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "1",
            mediaType: "IMAGE",
            mediaRef: "images/A_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "2" },
    update: {},
    create: {
      id: "2",
      phrase: "B",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "2",
            mediaType: "IMAGE",
            mediaRef: "images/B_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "3" },
    update: {},
    create: {
      id: "3",
      phrase: "C",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "3",
            mediaType: "IMAGE",
            mediaRef: "images/C_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "4" },
    update: {},
    create: {
      id: "4",
      phrase: "D",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "4",
            mediaType: "IMAGE",
            mediaRef: "images/D_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "5" },
    update: {},
    create: {
      id: "5",
      phrase: "E",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "5",
            mediaType: "IMAGE",
            mediaRef: "images/E_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "6" },
    update: {},
    create: {
      id: "6",
      phrase: "F",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "6",
            mediaType: "IMAGE",
            mediaRef: "images/F_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "7" },
    update: {},
    create: {
      id: "7",
      phrase: "G",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "7",
            mediaType: "IMAGE",
            mediaRef: "images/G_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "8" },
    update: {},
    create: {
      id: "8",
      phrase: "H",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "8",
            mediaType: "IMAGE",
            mediaRef: "images/H_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "9" },
    update: {},
    create: {
      id: "9",
      phrase: "I",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "9",
            mediaType: "IMAGE",
            mediaRef: "images/I_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
  await prisma.gesture.upsert({
    where: { id: "10" },
    update: {},
    create: {
      id: "10",
      phrase: "J",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "10",
            mediaType: "IMAGE",
            mediaRef: "images/J_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });

  await prisma.gesture.upsert({
    where: { id: "11" },
    update: {},
    create: {
      id: "11",
      phrase: "K",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "11",
            mediaType: "IMAGE",
            mediaRef: "images/K_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });

  await prisma.gesture.upsert({
    where: { id: "12" },
    update: {},
    create: {
      id: "12",
      phrase: "L",
      verified: true,
      topicId: "1",
      gestureMedia: {
        create: [
          {
            id: "12",
            mediaType: "IMAGE",
            mediaRef: "images/L_test.jpg",
            updatedAt: new Date(),
          },
        ],
      },
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
