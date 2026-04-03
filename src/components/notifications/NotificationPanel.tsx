"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Heart, MessageSquare, UserPlus, Check, X } from "lucide-react";
import { useNotifications } from "./NotificationProvider";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";

export default function NotificationPanel() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "LIKE_ON_POST": return <Heart size={14} className="text-rose-500" />;
      case "COMMENT_ON_POST": return <MessageSquare size={14} className="text-blue-500" />;
      case "REPLY_TO_COMMENT": return <MessageSquare size={14} className="text-blue-500" />;
      case "NEW_FOLLOWER": return <UserPlus size={14} className="text-amber-500" />;
      default: return <Bell size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-icon p-2 relative rounded-full"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-[#BC4749] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white border border-[#EEECEB] rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-[#EEECEB] flex items-center justify-between bg-[#FDFCFB]/50">
            <h3 className="font-bold text-sm tracking-tight uppercase" style={{ fontFamily: "var(--font-sans)" }}>Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-[#F5EDE4] text-[#D4A373] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} NEW
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#EEECEB]/50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 hover:bg-[#FDFCFB] transition-colors flex gap-4 items-start relative group",
                      !n.read && "bg-[#F5EDE4]/20"
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#EEECEB] flex items-center justify-center shadow-sm">
                        {getIcon(n.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#1A1A1A] leading-snug mb-1">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-[#999999] uppercase tracking-wider font-medium">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[#D4A373] mt-2 shadow-sm shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            className="block p-3 text-center text-xs font-bold text-[#D4A373] hover:bg-[#FDFCFB] border-t border-[#EEECEB] rounded-b-xl transition-colors"
            onClick={() => setIsOpen(false)}
          >
            VIEW ALL NOTIFICATIONS
          </Link>
        </div>
      )}
    </div>
  );
}
