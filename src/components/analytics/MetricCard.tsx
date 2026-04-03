"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon,
  className
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden group p-6 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between min-h-[160px]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-2xl bg-[#F5EDE4] group-hover:bg-[#1A1A1A] transition-colors duration-500">
           <div className="group-hover:text-white transition-colors duration-500">
             {icon}
           </div>
        </div>
        {change && (
          <div className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {isPositive ? "+" : "-"}{change}
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-[#1A1A1A] tracking-tight tabular-nums">
          {value}
        </h3>
      </div>

      {/* Decorative gradient bleed */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#D4A373]/5 rounded-full blur-3xl group-hover:bg-[#D4A373]/10 transition-all duration-500" />
    </motion.div>
  );
}
