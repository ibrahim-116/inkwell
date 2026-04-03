import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const TOPICS = [
  { label: "Technology", slug: "technology", description: "The latest in gadgets, software, and the digital frontier." },
  { label: "Science", slug: "science", description: "Exploring the mysteries of the universe and our world." },
  { label: "Philosophy", slug: "philosophy", description: "Deep thoughts on existence, ethics, and logic." },
  { label: "History", slug: "history", description: "Uncovering the stories that shaped humanity." },
  { label: "Film", slug: "film", description: "The art of cinema and visual storytelling." },
  { label: "Anime", slug: "anime", description: "Exploring the world of Japanese animation." },
  { label: "Business", slug: "business", description: "Entrepreneurship, markets, and economic trends." },
  { label: "Health", slug: "health", description: "Well-being, fitness, and medical breakthroughs." },
  { label: "AI", slug: "ai", description: "Artificial Intelligence and Machine Learning." },
  { label: "Space", slug: "space", description: "The final frontier and stellar discoveries." },
  { label: "Environment", slug: "environment", description: "Climate, nature, and sustainability." },
  { label: "Art", slug: "art", description: "Expression, aesthetics, and creativity." },
  { label: "Music", slug: "music", description: "The universal language of sound." },
  { label: "Travel", slug: "travel", description: "Wanderlust and cultural exploration." },
  { label: "Cooking", slug: "cooking", description: "Culinary arts and recipes." },
  { label: "Sports", slug: "sports", description: "Competition, teamwork, and athleticism." },
  { label: "Finance", slug: "finance", description: "Wealth, investment, and planning." },
  { label: "Gaming", slug: "gaming", description: "Digital worlds and interactive play." },
  { label: "Society", slug: "society", description: "Culture, sociology, and community." },
  { label: "Psychology", slug: "psychology", description: "The human mind and behavior." }
];

const SENTENCES = [
  "In the grand tapestry of human endeavor, we find ourselves at a critical crossroads.",
  "The implications of this discovery are far-reaching and potentially transformative.",
  "It is essential to consider the ethical dimensions of such rapid progress.",
  "Many experts argue that the current trajectory is unsustainable without intervention.",
  "On the other hand, skeptics point towards historical precedents that suggest caution.",
  "The intersection of technology and human spirit remains a profound area of study.",
  "We must analyze the underlying patterns that govern these complex systems.",
  "The beauty lies in the subtle details that often go unnoticed by the casual observer.",
  "Looking forward, the next decade promises to redefine our understanding of this field.",
  "Ultimately, the goal is to create a more harmonious balance between our tools and our values."
];

function generateContent(topicLabel: string): string {
  let content = `<h1>The Future of ${topicLabel}</h1>`;
  content += `<p>${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]}</p>`;
  content += `<h2>Core Concepts</h2>`;
  content += `<p>${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]} ${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]}</p>`;
  content += `<p>When we look at ${topicLabel.toLowerCase()}, we see a reflection of our own aspirations. ${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]}</p>`;
  content += `<h2>Practical Applications</h2>`;
  content += `<p>${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]}</p>`;
  content += `<ul><li>First observation: ${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]}</li><li>Second observation: ${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]}</li></ul>`;
  content += `<p>In conclusion, ${SENTENCES[Math.floor(Math.random() * SENTENCES.length)]}</p>`;
  return content;
}

async function main() {
  console.log("Starting database seed...");

  // 1. Ensure Topics exist
  const createdTopics = [];
  for (const t of TOPICS) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
    createdTopics.push(topic);
  }
  console.log(`Ensured ${createdTopics.length} topics exist.`);

  // 2. Get/Create Author
  let author = await prisma.user.findFirst();
  if (!author) {
    author = await prisma.user.create({
      data: {
        name: "Inkwell Curator",
        username: "curator",
        email: "curator@inkwell.com",
        onboardingCompleted: true,
      },
    });
    console.log("Created system author.");
  } else {
    console.log(`Using existing author: ${author.username}`);
  }

  // 3. Generate 500 Posts
  console.log("Seeding 500 posts...");
  const batchSize = 50;
  for (let i = 0; i < 500; i++) {
    const topic = createdTopics[i % createdTopics.length];
    const title = `${topic.label} Insights: Volume ${Math.floor(i / createdTopics.length) + 1}`;
    const slug = `${topic.slug}-insights-${i}-${Date.now()}`;
    
    await prisma.post.create({
      data: {
        title,
        slug,
        bodyText: generateContent(topic.label),
        status: "PUBLISHED",
        authorId: author.id,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)), // Random date in last ~11 days
        tags: {
          create: {
            topicId: topic.id,
          },
        },
      },
    });

    if ((i + 1) % batchSize === 0) {
      console.log(`Inserted ${i + 1}/500 posts...`);
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
