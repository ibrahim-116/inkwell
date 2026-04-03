import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, username: true } });
    const topics = await prisma.topic.findMany({ select: { id: true, label: true, slug: true } });
    console.log(JSON.stringify({ 
      users_count: users.length, 
      users,
      topics_count: topics.length,
      topics 
    }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
