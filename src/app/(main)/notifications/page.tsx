import { auth } from "@/auth";
import { getNotifications, markAllNotificationsAsRead } from "@/actions/notification.actions";
import { Bell, Heart, MessageSquare, UserPlus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationType } from "@prisma/client";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await getNotifications(50);
  
  // Mark all as read when visiting the page
  await markAllNotificationsAsRead();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "LIKE_ON_POST": return <Heart size={20} className="text-rose-500" />;
      case "COMMENT_ON_POST": return <MessageSquare size={20} className="text-blue-500" />;
      case "REPLY_TO_COMMENT": return <MessageSquare size={20} className="text-blue-500" />;
      case "NEW_FOLLOWER": return <UserPlus size={20} className="text-amber-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 
          className="text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Notifications
        </h1>
        <p className="text-gray-500">Stay updated with your social interactions on Inkwell.</p>
      </header>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#EEECEB] rounded-xl shadow-sm">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-lg text-gray-400 font-medium font-serif">Quiet for now...</p>
            <p className="text-sm text-gray-400">Interact with others to start seeing updates here.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id}
              className="p-6 bg-white border border-[#EEECEB] rounded-xl shadow-sm hover:shadow-md transition-all flex gap-6 items-start group"
            >
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#FDFCFB] border border-[#EEECEB] flex items-center justify-center shadow-inner">
                  {getIcon(n.type)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-[#F5EDE4] text-[#D4A373] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {n.type.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    <Calendar size={10} />
                    {format(new Date(n.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                <p className="text-[#1A1A1A] leading-relaxed mb-4">
                  {n.message}
                </p>
                {n.referenceId && (
                  <Link 
                    href={n.referenceType === "POST" ? `/post/${n.referenceId}` : `/profile/${n.referenceId}`}
                    className="text-xs font-bold text-[#D4A373] hover:underline uppercase tracking-widest"
                  >
                    View {n.referenceType?.toLowerCase()}
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
