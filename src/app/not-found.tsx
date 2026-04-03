import Link from "next/link";
import { MoveLeft, PenTool } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl w-full border border-[#EEECEB] bg-white p-12 md:p-20 shadow-[0_4px_12px_rgba(0,0,0,0.03)] rounded-[4px]">
        <div className="mb-12 flex justify-center">
          <div className="w-16 h-16 bg-[#FDFCFB] border border-[#EEECEB] rounded-[4px] flex items-center justify-center text-[#1A1A1A]">
            <PenTool size={32} strokeWidth={1.5} />
          </div>
        </div>

        <h1 
          className="text-7xl md:text-9xl font-bold mb-6 text-[#1A1A1A] leading-none"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          404
        </h1>
        
        <h2 
          className="text-2xl md:text-3xl font-semibold mb-8 text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          An unwritten chapter.
        </h2>

        <p 
          className="text-lg md:text-xl text-[#555555] mb-12 max-w-md mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          The page you are looking for has not been inked yet. 
          It might have been moved, or perhaps it was never meant to be read.
        </p>

        <Link
          href="/feed"
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] hover:bg-[#2D2D2D] text-[#FDFCFB] font-semibold rounded-[4px] transition-all transform hover:-translate-y-0.5 active:scale-95 group"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <MoveLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Return to Feed
        </Link>
      </div>

      <div className="mt-12 text-[#999999] text-xs uppercase tracking-[0.2em]">
        Inkwell &mdash; Premium Long-form Content
      </div>
    </div>
  );
}
