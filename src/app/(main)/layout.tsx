import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/nav/Navbar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-vellum)" }}>
      <Navbar user={session.user as any} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {children}
      </main>
    </div>
  );
}
