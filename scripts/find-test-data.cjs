const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ select: { username: true } });
  console.log('Username:', user?.username);
  const post = await prisma.post.findFirst({ where: { status: 'PUBLISHED' }, select: { slug: true, title: true } });
  console.log('Post:', post?.slug, '|', post?.title);
}

main().finally(() => prisma.$disconnect());
