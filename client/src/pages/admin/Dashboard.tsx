import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Users, Trophy, Map, GraduationCap, TrendingUp, 
  Flame, Calendar, FileText, Plus, ChevronRight, Activity,
  MessageCircle, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { User, Event, Spark } from "@shared/schema";

interface AdminStats {
  users: number;
  sparks: number;
  events: number;
  blogPosts: number;
  posts: number;
  registrations: number;
  activeChallenges?: number;
  upcomingTrips?: number;
  coachingSessions?: number;
  recentEvents: Event[];
  recentUsers: User[];
}

const userGrowthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 250 },
  { month: "Apr", users: 310 },
  { month: "May", users: 420 },
  { month: "Jun", users: 580 },
  { month: "Jul", users: 720 },
  { month: "Aug", users: 890 },
];

export function AdminDashboard() {
  const [copied, setCopied] = useState(false);
  
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: todaySpark } = useQuery<Spark>({
    queryKey: ["/api/sparks/today"],
  });

  const generateWhatsAppMessage = (spark: Spark) => {
    const passage = spark.fullPassage ? `_"${spark.fullPassage.slice(0, 200)}..."_` : '';
    const prayer = spark.prayerLine ? `\n\n🙏 *Prayer:*\n${spark.prayerLine}` : '';
    const action = spark.todayAction ? `\n\n💡 *Today's Action:*\n${spark.todayAction}` : '';
    
    return `*${spark.title}* 🔥

${spark.description || ''}

📖 *${spark.scriptureRef || 'Scripture'}*
${passage}${prayer}${action}

---
📱 Read the full devotional: https://reawakened.app/spark/${spark.id}
🌟 DOMINION Campaign - Day by Day`;
  };

  const copyToClipboard = async () => {
    if (!todaySpark) return;
    try {
      const message = generateWhatsAppMessage(todaySpark);
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copied! Paste it in your WhatsApp group.");
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error("Failed to copy. Please try again.");
    }
  };

  const metricCards = [
    { 
      label: "Total Users", 
      value: stats?.users || 0, 
      icon: Users, 
      color: "bg-blue-500",
      change: "+12%",
      changeType: "positive" as const
    },
    { 
      label: "Active Challenges", 
      value: stats?.activeChallenges || 8, 
      icon: Trophy, 
      color: "bg-amber-500",
      change: "+3",
      changeType: "positive" as const
    },
    { 
      label: "Upcoming Trips", 
      value: stats?.upcomingTrips || 4, 
      icon: Map, 
      color: "bg-[#4A7C7C]",
      change: "2 this month",
      changeType: "neutral" as const
    },
    { 
      label: "Coaching Sessions", 
      value: stats?.coachingSessions || 24, 
      icon: GraduationCap, 
      color: "bg-purple-500",
      change: "+8 this week",
      changeType: "positive" as const
    },
  ];

  const quickActions = [
    { label: "Add Spark", description: "New devotional content", icon: Flame, href: "/admin/sparks", color: "text-orange-500" },
    { label: "Create Event", description: "Schedule gathering", icon: Calendar, href: "/admin/events", color: "text-green-500" },
    { label: "Write Post", description: "Blog article", icon: FileText, href: "/admin/blog", color: "text-purple-500" },
    { label: "New Challenge", description: "Community challenge", icon: Trophy, href: "/admin/challenges", color: "text-amber-500" },
  ];

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Overview of your platform"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" data-testid="metrics-grid">
        {metricCards.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-0 shadow-sm" data-testid={`metric-card-${metric.label.toLowerCase().replace(/\s/g, '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                    <metric.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    metric.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                    metric.changeType === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-gray-900" data-testid={`text-metric-value-${metric.label.toLowerCase().replace(/\s/g, '-')}`}>
                    {isLoading ? "..." : metric.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{metric.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border-0 shadow-sm" data-testid="card-user-growth">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#7C9A8E]" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a2744" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1a2744" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2744', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#1a2744" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" data-testid="card-quick-actions">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#7C9A8E]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-auto py-3 px-3 hover:bg-gray-50"
                  data-testid={`button-quick-action-${action.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <action.icon className={`h-5 w-5 ${action.color} mr-3`} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Shareable Message */}
      <Card className="border-0 shadow-sm mb-8" data-testid="card-whatsapp-share">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            Today's WhatsApp Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySpark ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-bold text-gray-900 mb-2">{todaySpark.title}</p>
                <p className="text-xs text-gray-600 mb-2">{todaySpark.description}</p>
                <p className="text-xs text-gray-500">📖 {todaySpark.scriptureRef}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={copyToClipboard}
                  className={`flex-1 ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-[#25D366] hover:bg-[#20bd5a]'} text-white`}
                  data-testid="button-copy-whatsapp"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy for WhatsApp
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Copy and paste this formatted message to your WhatsApp group daily
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <Flame className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No spark for today yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm" data-testid="card-recent-activity">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#7C9A8E]" />
                Recent Activity
              </CardTitle>
              <Link href="/admin/analytics">
                <span className="text-sm text-[#4A7C7C] hover:underline cursor-pointer flex items-center gap-1" data-testid="link-view-all-activity">
                  View all <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentEvents && stats.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEvents.slice(0, 5).map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    data-testid={`activity-item-${event.id}`}
                  >
                    <div className="w-10 h-10 bg-[#7C9A8E]/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-[#7C9A8E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.startDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent events. Create your first event!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm" data-testid="card-recent-users">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Users className="h-5 w-5 text-[#7C9A8E]" />
                Recent Users
              </CardTitle>
              <Link href="/admin/users">
                <span className="text-sm text-[#4A7C7C] hover:underline cursor-pointer flex items-center gap-1" data-testid="link-view-all-users">
                  View all <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="space-y-3">
                {stats.recentUsers.slice(0, 5).map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    data-testid={`user-item-${user.id}`}
                  >
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#1a2744]/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#1a2744]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No users yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
