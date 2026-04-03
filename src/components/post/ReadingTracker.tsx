"use client";

import { useEffect, useRef } from "react";
import { updatePostEngagement } from "@/actions/post.actions";
import { usePathname } from "next/navigation";

interface ReadingTrackerProps {
  postId: string;
}

export default function ReadingTracker({ postId }: ReadingTrackerProps) {
  const lastSavedDepth = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only track on post pages
    if (!pathname.includes("/post/")) return;

    const handleScroll = () => {
      if (scrollTimeout.current) return;

      scrollTimeout.current = setTimeout(async () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;
        
        // Calculate depth (0 to 1)
        // fullHeight - windowHeight is the maximum possible scrollY
        const totalScrollable = fullHeight - windowHeight;
        if (totalScrollable <= 0) {
          scrollTimeout.current = null;
          return;
        }

        const currentDepth = Math.min(Math.max(scrollY / totalScrollable, 0), 1);

        // Only save if we've moved forward by at least 5% or reached the end
        if (currentDepth > lastSavedDepth.current + 0.05 || currentDepth === 1) {
          lastSavedDepth.current = currentDepth;
          await updatePostEngagement(postId, currentDepth);
        }

        scrollTimeout.current = null;
      }, 5000); // Throttled to every 5 seconds
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initial check (maybe they started partway down or it's a short post)
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [postId, pathname]);

  return null; // Invisible component
}
