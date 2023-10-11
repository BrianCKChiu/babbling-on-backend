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
            mediaType: "image",
            mediaRef: "images/A_test.png",
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
            mediaType: "image",
            mediaRef: "images/B_test.png",
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
            mediaType: "image",
            mediaRef: "images/C_test.png",
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
            mediaType: "image",
            mediaRef: "images/D_test.png",
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
            mediaType: "image",
            mediaRef: "images/E_test.png",
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
