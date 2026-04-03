import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = 'edd_91890f';
  console.log(`🌱 Seeding analytics for user: @${username}...`);

  // 1. Find the target user
  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    console.error(`User @${username} not found! Please log in first or create the user.`);
    process.exit(1);
    return;
  }

  // 2. Generate 10 high-quality dummy posts if they don't have enough
  const currentPosts = await prisma.post.count({ where: { authorId: user.id } });
  const postsToCreate = Math.max(0, 10 - currentPosts);

  const postTitles = [
    "The Future of Agentic Workflows",
    "Why Minimalism is the Ultimate Sophistication",
    "Navigating the Post-AI Landscape for Writers",
    "The Ghost in the Machine: Understanding LLMs",
    "Inkwell: Building the Future of Long-form Content",
    "Digital Detox: Reclaiming your Focus in 2024",
    "Mastering the Art of Deep Work",
    "The Paradox of Choice in a Hyper-connected World",
    "Why Modern Architecture Needs More Soul",
    "Reflections on a Decade of Open Source",
  ];

  for (let i = 0; i < postsToCreate; i++) {
    const title = postTitles[i] || `New Perspective Part ${i + 1}`;
    const slug = `${username}-post-${i}-${Date.now()}`;
    
    await prisma.post.create({
      data: {
        title,
        slug,
        authorId: user.id,
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - (15 + i) * 24 * 60 * 60 * 1000), // Published 15-25 days ago
        bodyText: "This is a dummy post to verify analytics visualization.",
        viewCount: Math.floor(Math.random() * 2000) + 500,
        likeCount: Math.floor(Math.random() * 200) + 50,
        commentCount: Math.floor(Math.random() * 50) + 10,
        tags: {
          create: {
            topicId: (await prisma.topic.findFirst())?.id || ""
          }
        }
      }
    });
  }
  console.log(`Ensured 10 posts exist for @${username}.`);

  const allUserPosts = await prisma.post.findMany({ 
    where: { authorId: user.id, status: PostStatus.PUBLISHED } 
  });

  // 3. Generate 30 days of metrics for EACH post
  const now = new Date();
  console.log(`Generating 30 days of time-series data for ${allUserPosts.length} posts...`);

  for (const post of allUserPosts) {
    let trend = 20 + Math.random() * 80; // Starting daily views
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Random trend (mostly upwards)
      trend += (Math.random() - 0.4) * 15; 
      const views = Math.floor(Math.max(5, trend));
      const likes = Math.floor(views * (0.05 + Math.random() * 0.1));
      const comments = Math.floor(likes * (0.05 + Math.random() * 0.15));

      await prisma.postDailyMetric.upsert({
        where: {
          postId_date: {
            postId: post.id,
            date: date
          }
        },
        update: { views, likes, comments },
        create: {
          postId: post.id,
          date: date,
          views,
          likes,
          comments
        }
      });
    }
  }

  // 4. Generate user daily metrics (Followers)
  console.log(`Generating follower growth for @${username}...`);
  let followers = 45;
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);

    followers += Math.floor(Math.random() * 3); // 0-2 new followers each day
    
    await prisma.userDailyMetric.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date
        }
      },
      update: { followers },
      create: {
        userId: user.id,
        date: date,
        followers
      }
    });
  }

  console.log(`✅ Success! User @${username} is now an analytics-heavy power user.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
