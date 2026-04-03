"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Menu, User as UserIcon, LogOut, Settings, Bookmark, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

import SearchDropdown from "./SearchDropdown";
import NotificationPanel from "@/components/notifications/NotificationPanel";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(253, 252, 251, 0.8)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-8 flex-1">
          <Link href="/feed" className="flex items-center gap-2 shrink-0">
            <PenLine className="w-6 h-6" style={{ color: "var(--color-quill)" }} />
            <span
              className="text-xl font-bold hidden sm:block"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-ink)" }}
            >
              Inkwell
            </span>
          </Link>

          <div className="hidden md:flex relative flex-1 max-w-sm">
            <SearchDropdown />
          </div>
        </div>

        {/* Right: Actions */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/post/new"
            className={cn(
              "btn btn-ghost btn-sm gap-2",
              pathname === "/post/new" && "bg-white shadow-sm"
            )}
          >
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Write</span>
          </Link>

          <NotificationPanel />

          <div className="divider-v w-px h-6 mx-1 bg-gray-200 hidden sm:block" />

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              {user.image ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                  <Image
                    src={user.image}
                    alt={user.name ?? "User"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 text-orange-700 font-bold text-xs">
                  {user.name?.[0].toUpperCase() ?? "U"}
                </div>
              )}
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200"
                style={{ borderColor: "var(--color-border)", zIndex: 100 }}
              >
                <div className="px-4 py-3 border-b mb-1" style={{ borderColor: "var(--color-border)" }}>
                  <p className="text-sm font-semibold truncate text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">@{user.username || "user"}</p>
                </div>

                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  Your Profile
                </Link>
                <Link
                  href="/bookmarks"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Bookmark className="w-4 h-4" />
                  Saved Posts
                </Link>
                <Link
                  href={`/profile/${user.username}?tab=analytics`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <BarChart3 className="w-4 h-4 text-[#D4A373]" />
                  Analytics
                </Link>
                <Link
                  href="/drafts"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <PenLine className="w-4 h-4 text-amber-600" />
                  Your Drafts
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>

                <div className="border-t my-1" style={{ borderColor: "var(--color-border)" }} />
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button 
            className="md:hidden btn btn-ghost btn-icon p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg animate-in slide-in-from-top-2 duration-200" style={{ borderColor: "var(--color-border)" }}>
          <div className="px-4 pt-2 pb-4 space-y-1">
            <div className="mb-4">
              <SearchDropdown />
            </div>
            <Link
              href="/post/new"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              <PenLine className="w-5 h-5" />
              Write a Story
            </Link>
            <Link
              href={`/profile/${user.username}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              <UserIcon className="w-5 h-5" />
              Profile
            </Link>
            <Link
              href="/bookmarks"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              <Bookmark className="w-5 h-5" />
              Bookmarks
            </Link>
             <Link
              href={`/profile/${user.username}?tab=analytics`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <button
               onClick={() => {
                 setIsMobileMenuOpen(false);
                 signOut({ callbackUrl: "/" });
               }}
               className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
               <LogOut className="w-5 h-5" />
               Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
