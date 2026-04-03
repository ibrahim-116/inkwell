import { PrismaClient, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding analytics data...');

  // 1. Get or Create a test user
  let user = await prisma.user.findFirst({
    where: { username: 'demo_author' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'demo_author',
        email: 'demo@inkwell.com',
        name: 'Demo Author',
        onboardingCompleted: true,
      }
    });
    console.log('Created demo user');
  }

  // 2. Create some demo posts if none exist
  const postCount = await prisma.post.count({ where: { authorId: user.id } });
  
  if (postCount < 3) {
    const postData = [
      { title: 'The Art of Minimalist Writing', slug: 'art-of-minimalist-writing' },
      { title: 'Why Coffee is the Ink of Modern Authors', slug: 'coffee-ink-modern-authors' },
      { title: 'Finding your Voice in a Digital World', slug: 'finding-voice-digital-world' },
    ];

    for (const p of postData) {
      await prisma.post.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          title: p.title,
          slug: p.slug,
          authorId: user!.id,
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
          bodyText: 'This is a demo post for analytics visualization.',
          viewCount: Math.floor(Math.random() * 5000),
          likeCount: Math.floor(Math.random() * 500),
          commentCount: Math.floor(Math.random() * 50),
        }
      });
    }
    console.log('Created demo posts');
  }

  const posts = await prisma.post.findMany({ where: { authorId: user.id } });

  // 3. Generate 30 days of metrics
  const now = new Date();
  
  for (const post of posts) {
    console.log(`Generating metrics for: ${post.title}`);
    let baseViews = 50 + Math.random() * 200;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Random walk for views
      baseViews += (Math.random() - 0.45) * 50; 
      const views = Math.max(10, Math.floor(baseViews));
      const likes = Math.floor(views * (0.05 + Math.random() * 0.1)); // 5-15% like rate
      const comments = Math.floor(likes * (0.1 + Math.random() * 0.2)); // 10-30% comment rate

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

  // 4. Generate user follower metrics
  console.log(`Generating follower metrics for: ${user.username}`);
  let baseFollowers = 100;
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);

    baseFollowers += Math.floor(Math.random() * 5); // 0-5 new followers per day
    
    await prisma.userDailyMetric.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date
        }
      },
      update: { followers: baseFollowers },
      create: {
        userId: user.id,
        date: date,
        followers: baseFollowers
      }
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
