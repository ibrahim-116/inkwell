import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const duplicates = await prisma.userTopicAffinity.groupBy({
    by: ['userId', 'topicId'],
    _count: {
      userId: true,
    },
    having: {
      userId: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  if (duplicates.length > 0) {
    console.log("Found duplicate affinities:", duplicates);
  } else {
    console.log("No duplicate affinities found.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
