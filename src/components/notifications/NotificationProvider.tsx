"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";
import { Notification } from "@prisma/client";
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead } from "@/actions/notification.actions";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      // Initial fetch
      getNotifications().then(setNotifications);
      getUnreadNotificationCount().then((res) => setUnreadCount(res.count));

      // Subscribe to personal pusher channel
      const channel = pusherClient.subscribe(`user-${session.user.id}`);

      channel.bind("new-notification", (data: Notification) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
        setNewNotification(data);
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => setNewNotification(null), 5000);
      });

      return () => {
        pusherClient.unsubscribe(`user-${session.user.id}`);
      };
    }
  }, [session?.user?.id]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await markNotificationAsRead(id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };


  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
      
      {/* Real-time Toast */}
      <AnimatePresence>
        {newNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
          >
            <div className="bg-[#1A1A1A] text-[#FDFCFB] p-4 rounded-lg shadow-2xl border border-white/10 flex items-start gap-4">
              <div className="bg-[#D4A373] p-2 rounded-full shrink-0">
                <Bell size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-tight mb-1">New Interaction</p>
                <p className="text-xs text-white/70 line-clamp-2">{newNotification.message}</p>
              </div>
              <button 
                onClick={() => setNewNotification(null)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
