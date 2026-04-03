import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TOPICS = [
  { slug: "technology", label: "Technology", emoji: "💻" },
  { slug: "science", label: "Science", emoji: "🔬" },
  { slug: "philosophy", label: "Philosophy", emoji: "🧠" },
  { slug: "politics", label: "Politics", emoji: "🏛️" },
  { slug: "history", label: "History", emoji: "📜" },
  { slug: "finance", label: "Finance", emoji: "📈" },
  { slug: "business", label: "Business", emoji: "💼" },
  { slug: "health", label: "Health", emoji: "🌿" },
  { slug: "gaming", label: "Gaming", emoji: "🎮" },
  { slug: "sports", label: "Sports", emoji: "⚽" },
  { slug: "anime", label: "Anime", emoji: "🎌" },
  { slug: "film", label: "Film", emoji: "🎬" },
  { slug: "music", label: "Music", emoji: "🎵" },
  { slug: "art", label: "Art", emoji: "🎨" },
  { slug: "travel", label: "Travel", emoji: "✈️" },
  { slug: "food", label: "Food", emoji: "🍜" },
];

async function main() {
  console.log("Seeding topics...");
  
  for (const topic of TOPICS) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {
        label: topic.label,
        // emoji could be a field in your schema, let's check
      },
      create: {
        slug: topic.slug,
        label: topic.label,
      },
    });
  }
  
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
