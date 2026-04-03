"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Users, 
  MessageSquare,
  TrendingUp,
  Award
} from "lucide-react";
import { getAuthorAnalyticsReport } from "@/actions/analytics.actions";
import MetricCard from "./MetricCard";
import PerformanceChart from "./PerformanceChart";
import TopStoriesTable from "./TopStoriesTable";
import { motion } from "framer-motion";

interface AnalyticsReport {
  summary: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalFollowers: number;
  };
  timeSeries: {
    date: string;
    views: number;
    engagement: number;
  }[];
  topPosts: {
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: Date | null;
  }[];
}

export default function AuthorAnalytics() {
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const report = await getAuthorAnalyticsReport(30);
        setData(report as AnalyticsReport);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-white/50 rounded-[2rem] border border-white" />
          ))}
        </div>
        <div className="h-[400px] bg-white/50 rounded-[2rem] border border-white" />
        <div className="h-64 bg-white/50 rounded-[2rem] border border-white" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-12">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Impressions"
          value={data.summary.totalViews.toLocaleString()}
          icon={<BarChart3 className="w-5 h-5" />}
          change="12%"
          isPositive={true}
        />
        <MetricCard 
          title="Reader Community"
          value={data.summary.totalFollowers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          change="4.2%"
          isPositive={true}
        />
        <MetricCard 
          title="Story Resonance"
          value={data.summary.totalLikes.toLocaleString()}
          icon={<TrendingUp className="w-5 h-5" />}
          change="8%"
          isPositive={true}
        />
        <MetricCard 
          title="Engagement"
          value={data.summary.totalComments.toLocaleString()}
          icon={<MessageSquare className="w-5 h-5" />}
          change="2.1%"
          isPositive={false}
        />
      </div>

      {/* Primary Performance Graph */}
      <div className="grid grid-cols-1 gap-8">
        <PerformanceChart data={data.timeSeries} />
      </div>

      {/* Detailed Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <TopStoriesTable posts={data.topPosts} />
         </div>
         
         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 rounded-[2rem] text-[#1A1A1A] flex flex-col justify-between"
         >
            <div>
              <div className="w-12 h-12 bg-[#F5EDE4] rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Writing Milestone</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                You&apos;ve consistently published {data.topPosts.length} stories this month. Your resonance score is in the top 5% of Inkwell creators.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/60 rounded-2xl border border-white/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373]">Achievement</span>
                  <p className="text-sm font-bold mt-1 text-[#1A1A1A]">10k Lifetime Impressions</p>
                </div>
                <div className="p-4 bg-white/60 rounded-2xl border border-white/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Next Peak</span>
                  <p className="text-sm font-bold mt-1 text-[#1A1A1A]">Reach 100 Followers</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-2xl transition-all hover:shadow-lg active:scale-[0.98]">
              Download Report
            </button>
         </motion.div>
      </div>
    </div>
  );
}
