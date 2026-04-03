import { PrismaClient, PostStatus } from "@prisma/client";

const prisma = new PrismaClient();

const AUTHORS = [
  {
    name: "Elena Vance",
    username: "elena_v",
    email: "elena@inkwell.com",
    bio: "Exploring the intersection of technology and human nature. Award-winning essayist.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    name: "Marcus Thorne",
    username: "mthorn",
    email: "marcus@inkwell.com",
    bio: "Historical deep-dives and philosophical reflections on modern society.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    name: "Aria Chen",
    username: "ariachen",
    email: "aria@inkwell.com",
    bio: "Science communicator. Making complex physics and biology accessible to all.",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
];

const CONTENT_SNIPPETS = [
  "In an era defined by rapid digital transformation, we often overlook the subtle shifts in our social fabric.",
  "The fundamental laws of thermodynamics hold a mirror to our own societal structures.",
  "Why do we keep returning to the stories of the past when our future remains so uncertain?",
  "The architecture of modern cities is a testament to our collective memory and forgotten aspirations.",
  "The rise of artificial intelligence isn't just a technical revolution; it's a mirror of our own cognitive biases.",
  "True innovation often happens at the edges, where seemingly unrelated disciplines collide and spark new ideas.",
];

async function main() {
  console.log("Seeding dummy feed data...");

  // 1. Get Topics
  const allTopics = await prisma.topic.findMany();
  if (allTopics.length === 0) {
    throw new Error("No topics found. Please run seed-topics.ts first.");
  }

  // 2. Create/Upsert Authors
  const authRecords = [];
  for (const author of AUTHORS) {
    const user = await prisma.user.upsert({
      where: { email: author.email },
      update: {},
      create: {
        ...author,
        onboardingCompleted: true,
      },
    });
    authRecords.push(user);
  }
  console.log(`Ensured ${authRecords.length} authors exist.`);

  // 3. Generate Posts per Topic
  let postCount = 0;
  for (const topic of allTopics) {
    for (let i = 0; i < 3; i++) {
      const author = authRecords[Math.floor(Math.random() * authRecords.length)];
      const title = `${topic.label} in the Modern Age: A ${i + 1}st Look`;
      const subtitle = `Exploring unexpected perspectives on ${topic.label.toLowerCase()} evolution.`;
      const slug = `${topic.slug}-story-${i}-${Date.now()}`;
      
      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

      await prisma.post.create({
        data: {
          authorId: author.id,
          title,
          subtitle,
          slug,
          bodyText: `<h1>${title}</h1><p>${CONTENT_SNIPPETS[Math.floor(Math.random() * CONTENT_SNIPPETS.length)]}</p><p>This is a deeper exploration of ${topic.label.toLowerCase()} that challenges existing paradigms.</p><p>${CONTENT_SNIPPETS[Math.floor(Math.random() * CONTENT_SNIPPETS.length)]}</p>`,
          status: PostStatus.PUBLISHED,
          publishedAt,
          readTimeMinutes: Math.floor(Math.random() * 10) + 3,
          viewCount: Math.floor(Math.random() * 1000),
          tags: {
            create: {
              topicId: topic.id,
            },
          },
        },
      });
      postCount++;
    }
  }

  console.log(`Successfully seeded ${postCount} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
