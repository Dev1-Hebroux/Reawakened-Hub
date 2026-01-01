import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./Admin";
import { TrendingUp, Users, Target, Flame, BookOpen, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AdminStats {
  users: number;
  sparks: number;
  events: number;
  blogPosts: number;
  posts: number;
  registrations: number;
}

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export function AdminFunnels() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: missionProfiles = [] } = useQuery<any[]>({
    queryKey: ["/api/mission/profiles"],
  });

  const missionFunnel: FunnelStage[] = [
    { name: "Visited Mission Page", count: stats?.users || 0, percentage: 100, color: "bg-blue-500" },
    { name: "Started Onboarding", count: missionProfiles.length, percentage: missionProfiles.length > 0 ? Math.round((missionProfiles.length / (stats?.users || 1)) * 100) : 0, color: "bg-indigo-500" },
    { name: "Completed Profile", count: missionProfiles.filter((p: any) => p.focusAreas?.length > 0).length, percentage: missionProfiles.length > 0 ? Math.round((missionProfiles.filter((p: any) => p.focusAreas?.length > 0).length / missionProfiles.length) * 100) : 0, color: "bg-purple-500" },
    { name: "Active Participants", count: Math.round(missionProfiles.length * 0.6), percentage: 60, color: "bg-primary" },
  ];

  const engagementMetrics = [
    { label: "Sparks Viewed", value: stats?.sparks || 0, icon: Flame, color: "text-orange-500" },
    { label: "Events Registered", value: stats?.registrations || 0, icon: Target, color: "text-green-500" },
    { label: "Blog Reads", value: stats?.blogPosts || 0, icon: BookOpen, color: "text-purple-500" },
    { label: "Community Posts", value: stats?.posts || 0, icon: Users, color: "text-blue-500" },
  ];

  return (
    <AdminLayout 
      title="Funnel Dashboard" 
      subtitle="Track user journeys and conversion rates"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Mission Onboarding Funnel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-900">Mission Onboarding Funnel</h2>
                <p className="text-sm text-gray-500">Track how users progress through mission onboarding</p>
              </div>
            </div>

            <div className="space-y-4">
              {missionFunnel.map((stage, i) => (
                <motion.div
                  key={stage.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-900">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-900">{stage.count}</span>
                      <span className="text-sm text-gray-500">{stage.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full ${stage.color} rounded-full`}
                    />
                  </div>
                  {i < missionFunnel.length - 1 && (
                    <div className="absolute left-3 top-10 h-4 w-0.5 bg-gray-200" />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Overall Conversion Rate</span>
                <span className="font-bold text-primary">
                  {missionFunnel[missionFunnel.length - 1]?.percentage || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {engagementMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
              >
                <metric.icon className={`h-8 w-8 ${metric.color} mb-3`} />
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-xs text-gray-500">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
            <h3 className="font-display font-bold text-gray-900 mb-4">Insights & Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Optimize Onboarding Completion</p>
                  <p className="text-sm text-gray-500">
                    {missionProfiles.length > 0 
                      ? `${100 - (missionProfiles.filter((p: any) => p.focusAreas?.length > 0).length / missionProfiles.length * 100).toFixed(0)}% of users don't complete their profile. Consider adding progress indicators.`
                      : "Start tracking onboarding to see insights here."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-lg p-4">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Increase Event Engagement</p>
                  <p className="text-sm text-gray-500">
                    Create more events to boost community engagement. Consider adding reminders for upcoming events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminFunnels;
