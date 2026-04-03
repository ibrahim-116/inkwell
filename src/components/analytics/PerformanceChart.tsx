"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { motion } from "framer-motion";

interface PerformanceChartProps {
  data: {
    date: string;
    views: number;
    engagement: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 border border-[#EEECEB] shadow-2xl rounded-2xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999] mb-2">{format(parseISO(label), 'MMM d, yyyy')}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-medium text-[#D4A373]">Views</span>
            <span className="text-sm font-bold text-[#1A1A1A] tabular-nums">{payload[0].value?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-medium text-[#1A1A1A]">Engagement</span>
            <span className="text-sm font-bold text-[#1A1A1A] tabular-nums">{payload[1].value?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white/50 backdrop-blur rounded-[2rem] border border-white">
        <p className="text-gray-400 font-medium italic">No tracking data available yet.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] h-[400px] w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-[#1A1A1A]">Performance Trends</h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Daily Views & Social Engagement</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#D4A373]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Engagement</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A373" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#D4A373" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#999999' }}
              minTickGap={30}
              tickFormatter={(str) => format(parseISO(str), 'MMM d')}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#999999' }}
              tickFormatter={(num) => num >= 1000 ? `${(num/1000).toFixed(1)}k` : num}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="views" 
              stroke="#D4A373" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorViews)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="engagement" 
              stroke="#1A1A1A" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorEng)" 
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
