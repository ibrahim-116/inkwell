import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { z } from "zod";
import { slugify, estimateReadTime } from "@/lib/utils";

const schema = z.object({
  id: z.string().nullable().optional(),
  title: z.string().max(150).default("Untitled"),
  subtitle: z.string().max(280).optional().nullable().or(z.literal("")),
  content: z.any(),
  topics: z.array(z.string()).max(5).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      console.error("Zod validation failure:", parsed.error.format());
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { id, title, subtitle, content, topics, status, coverImageUrl } = parsed.data;
    const authorId = session.user.id;

    // Estimate read time
    const plainText = JSON.stringify(content).replace(/<[^>]*>?/gm, " "); 
    const readTimeMinutes = estimateReadTime(plainText);

    let post;

    if (id) {
      // Update existing post
      post = await prisma.post.update({
        where: { id, authorId },
        data: {
          title,
          subtitle,
          bodyJson: content,
          bodyText: plainText,
          status,
          coverImageUrl: coverImageUrl || null,
          readTimeMinutes,
          publishedAt: status === "PUBLISHED" ? new Date() : undefined,
          tags: {
            deleteMany: {},
            create: topics.map((topicId) => ({
              topicId: topicId,
            })),
          },
        },
      });
    } else {
      // Create new post
      // Generate slug
      let slug = slugify(title);
      const existing = await prisma.post.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      post = await prisma.post.create({
        data: {
          authorId,
          title,
          subtitle,
          slug,
          bodyJson: content,
          bodyText: plainText,
          status,
          coverImageUrl: coverImageUrl || null,
          readTimeMinutes,
          publishedAt: status === "PUBLISHED" ? new Date() : null,
          tags: {
            create: topics.map((topicId) => ({
              topicId: topicId,
            })),
          },
        },
      });
    }

    return NextResponse.json({ success: true, slug: post.slug, id: post.id });
  } catch (error) {
    console.error("Post processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as PostStatus | null;
  const authorId = searchParams.get("authorId");

  try {
    const posts = await prisma.post.findMany({
      where: {
        status: status || undefined,
        authorId: authorId || undefined,
      },
      include: {
        author: {
          select: { name: true, username: true, avatarUrl: true },
        },
        tags: {
          include: { Topic: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
