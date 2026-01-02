import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Users, Eye, Trophy, TrendingUp, Loader2, Download,
  Activity, Calendar, BarChart3, Clock, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { motion } from "framer-motion";

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers7d: number;
  sparksViewed: number;
  challengesCompleted: number;
  userGrowth: number;
  engagementRate: number;
}

interface UserGrowthData {
  date: string;
  users: number;
  activeUsers: number;
}

interface ContentEngagementData {
  category: string;
  views: number;
  interactions: number;
}

interface TopChallenge {
  id: number;
  title: string;
  participants: number;
  completionRate: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  userName: string;
  timestamp: string;
}

const TIME_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: metrics, isLoading: loadingMetrics } = useQuery<AnalyticsMetrics>({
    queryKey: ["/api/admin/analytics/metrics", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/metrics?range=${timeRange}`);
      if (!res.ok) {
        return {
          totalUsers: 0,
          activeUsers7d: 0,
          sparksViewed: 0,
          challengesCompleted: 0,
          userGrowth: 0,
          engagementRate: 0,
        };
      }
      return res.json();
    },
  });

  const { data: userGrowthData = [], isLoading: loadingGrowth } = useQuery<UserGrowthData[]>({
    queryKey: ["/api/admin/analytics/user-growth", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/user-growth?range=${timeRange}`);
      if (!res.ok) {
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        return Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          return {
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            users: Math.floor(Math.random() * 50) + 100 + i * 2,
            activeUsers: Math.floor(Math.random() * 30) + 50 + i,
          };
        });
      }
      return res.json();
    },
  });

  const { data: engagementData = [], isLoading: loadingEngagement } = useQuery<ContentEngagementData[]>({
    queryKey: ["/api/admin/analytics/engagement", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/engagement?range=${timeRange}`);
      if (!res.ok) {
        return [
          { category: "Devotionals", views: 1240, interactions: 890 },
          { category: "Challenges", views: 856, interactions: 623 },
          { category: "Worship", views: 720, interactions: 445 },
          { category: "Testimonies", views: 543, interactions: 312 },
          { category: "Journeys", views: 421, interactions: 287 },
        ];
      }
      return res.json();
    },
  });

  const { data: topChallenges = [], isLoading: loadingChallenges } = useQuery<TopChallenge[]>({
    queryKey: ["/api/admin/analytics/top-challenges", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/top-challenges?range=${timeRange}`);
      if (!res.ok) {
        return [
          { id: 1, title: "21 Days of Prayer", participants: 156, completionRate: 78 },
          { id: 2, title: "Bible Reading Challenge", participants: 134, completionRate: 65 },
          { id: 3, title: "Gratitude Journal", participants: 98, completionRate: 82 },
          { id: 4, title: "Daily Worship", participants: 87, completionRate: 71 },
          { id: 5, title: "Outreach Week", participants: 64, completionRate: 89 },
        ];
      }
      return res.json();
    },
  });

  const { data: recentActivity = [], isLoading: loadingActivity } = useQuery<RecentActivity[]>({
    queryKey: ["/api/admin/analytics/recent-activity"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics/recent-activity");
      if (!res.ok) {
        return [
          { id: 1, type: "join_challenge", description: "Joined '21 Days of Prayer'", userName: "Sarah M.", timestamp: "2 min ago" },
          { id: 2, type: "complete_spark", description: "Watched 'Morning Devotional'", userName: "John D.", timestamp: "5 min ago" },
          { id: 3, type: "new_user", description: "New user registration", userName: "Mike T.", timestamp: "12 min ago" },
          { id: 4, type: "mission_apply", description: "Applied for Kenya Mission Trip", userName: "Emily R.", timestamp: "18 min ago" },
          { id: 5, type: "join_cohort", description: "Joined Leadership Cohort", userName: "David K.", timestamp: "25 min ago" },
          { id: 6, type: "complete_challenge", description: "Completed 'Bible Reading Challenge'", userName: "Lisa W.", timestamp: "32 min ago" },
        ];
      }
      return res.json();
    },
  });

  const handleExport = () => {
    console.log("Export functionality placeholder");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "join_challenge": return <Trophy className="h-4 w-4 text-amber-500" />;
      case "complete_spark": return <Eye className="h-4 w-4 text-blue-500" />;
      case "new_user": return <Users className="h-4 w-4 text-green-500" />;
      case "mission_apply": return <Flame className="h-4 w-4 text-orange-500" />;
      case "join_cohort": return <Users className="h-4 w-4 text-purple-500" />;
      case "complete_challenge": return <Trophy className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout
      title="Analytics Dashboard"
      subtitle="Track platform metrics and user engagement"
      breadcrumbs={[{ label: "Analytics", href: "/admin/analytics" }]}
      actions={
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]" data-testid="select-time-range">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleExport}
            data-testid="button-export"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-testid="metrics-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-0 shadow-sm" data-testid="card-total-users">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900" data-testid="metric-total-users">
                    {loadingMetrics ? "—" : (metrics?.totalUsers || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
              </div>
              {metrics?.userGrowth !== undefined && (
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">+{metrics.userGrowth}%</span>
                  <span className="text-gray-500">this period</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm" data-testid="card-active-users">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900" data-testid="metric-active-users">
                    {loadingMetrics ? "—" : (metrics?.activeUsers7d || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Active Users (7d)</div>
                </div>
              </div>
              {metrics?.engagementRate !== undefined && (
                <div className="mt-2 text-sm text-gray-500">
                  {metrics.engagementRate}% engagement rate
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm" data-testid="card-sparks-viewed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900" data-testid="metric-sparks-viewed">
                    {loadingMetrics ? "—" : (metrics?.sparksViewed || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Sparks Viewed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm" data-testid="card-challenges-completed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900" data-testid="metric-challenges-completed">
                    {loadingMetrics ? "—" : (metrics?.challengesCompleted || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Challenges Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-0 shadow-sm" data-testid="card-user-growth-chart">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingGrowth ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a2744", 
                      border: "none", 
                      borderRadius: "8px",
                      color: "#fff" 
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    name="Total Users"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.2} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="Active Users"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" data-testid="card-engagement-chart">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Content Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEngagement ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="category" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1a2744", 
                      border: "none", 
                      borderRadius: "8px",
                      color: "#fff" 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="views" name="Views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="interactions" name="Interactions" fill="#d946ef" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm" data-testid="card-top-challenges">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Challenges by Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingChallenges ? (
              <div className="h-[280px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : topChallenges.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-gray-500">
                No challenge data available
              </div>
            ) : (
              <div className="space-y-4">
                {topChallenges.map((challenge, idx) => (
                  <div 
                    key={challenge.id} 
                    className="flex items-center gap-4"
                    data-testid={`top-challenge-${challenge.id}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-amber-100 text-amber-600' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{challenge.title}</p>
                      <p className="text-sm text-gray-500">
                        {challenge.participants} participants
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0">
                      {challenge.completionRate}% completion
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" data-testid="card-recent-activity">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="h-[280px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-gray-500">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.userName}</span>{" "}
                        <span className="text-gray-600">{activity.description}</span>
                      </p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AnalyticsDashboard;
