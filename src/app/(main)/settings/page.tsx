import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAllTopics } from "@/actions/user.actions";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      interests: {
        select: {
          topicId: true,
        },
      },
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  const allTopics = await getAllTopics();

  return (
    <div className="min-h-screen bg-[var(--color-vellum)]">
      <div className="max-w-4xl mx-auto py-12">
        <div className="px-4 mb-8">
          <p className="text-[var(--color-quill)] font-bold tracking-tighter uppercase text-[10px]">Registry & Archive</p>
          <h1 className="text-5xl font-serif font-bold text-[var(--color-ink)] tracking-tight leading-none mt-2">
            Personal <span className="italic">Proclamation.</span>
          </h1>
        </div>
        
        <SettingsForm user={currentUser} allTopics={allTopics} />
      </div>
    </div>
  );
}
