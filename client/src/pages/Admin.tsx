import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, Calendar, Flame, FileText, Users, 
  MessageSquare, Target, Trophy, TrendingUp, Menu, X,
  ChevronRight, Plus, Settings, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { User, Event } from "@shared/schema";

interface AdminStats {
  users: number;
  sparks: number;
  events: number;
  blogPosts: number;
  posts: number;
  registrations: number;
  recentEvents: Event[];
  recentUsers: User[];
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "events", label: "Events", icon: Calendar, href: "/admin/events" },
  { id: "sparks", label: "Sparks", icon: Flame, href: "/admin/sparks" },
  { id: "blog", label: "Blog Posts", icon: FileText, href: "/admin/blog" },
  { id: "missions", label: "Mission Control", icon: Target, href: "/admin/missions" },
  { id: "challenges", label: "Challenges", icon: Trophy, href: "/admin/challenges" },
  { id: "users", label: "Users", icon: Users, href: "/admin/users" },
  { id: "moderation", label: "Moderation", icon: MessageSquare, href: "/admin/moderation" },
  { id: "funnels", label: "Funnels", icon: TrendingUp, href: "/admin/funnels" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth() as { user: User | null; isAuthenticated: boolean };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard.</p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#1a2744] dark:bg-gray-950 text-white">
        <div className="flex items-center h-16 px-6 border-b border-white/10">
          <Link href="/">
            <span className="text-xl font-display font-bold cursor-pointer">Reawakened</span>
          </Link>
          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Admin</span>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
            return (
              <Link key={item.id} href={item.href}>
                <span className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName || "Admin"}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#1a2744] text-white z-50 lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
                <span className="text-xl font-display font-bold">Admin</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.id} href={item.href}>
                      <span 
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                          isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 lg:px-8">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 mr-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <Link href="/">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" /> Exit Admin
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Dashboard Page
export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    { label: "Total Users", value: stats?.users || 0, icon: Users, color: "bg-blue-500" },
    { label: "Sparks", value: stats?.sparks || 0, icon: Flame, color: "bg-orange-500" },
    { label: "Events", value: stats?.events || 0, icon: Calendar, color: "bg-green-500" },
    { label: "Blog Posts", value: stats?.blogPosts || 0, icon: FileText, color: "bg-purple-500" },
    { label: "Community Posts", value: stats?.posts || 0, icon: MessageSquare, color: "bg-pink-500" },
    { label: "Registrations", value: stats?.registrations || 0, icon: Target, color: "bg-teal-500" },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of your platform">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : stat.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/events">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <Calendar className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Add Event</div>
                <div className="text-xs text-gray-500">Create gathering</div>
              </div>
            </Button>
          </Link>
          <Link href="/admin/sparks">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <div className="text-left">
                <div className="font-medium">Add Spark</div>
                <div className="text-xs text-gray-500">New devotional</div>
              </div>
            </Button>
          </Link>
          <Link href="/admin/blog">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <FileText className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="font-medium">Write Post</div>
                <div className="text-xs text-gray-500">Blog article</div>
              </div>
            </Button>
          </Link>
          <Link href="/admin/missions">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <Target className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">New Mission</div>
                <div className="text-xs text-gray-500">Create project</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">Recent Events</h2>
            <Link href="/admin/events">
              <span className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.recentEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <Calendar className="h-5 w-5 text-green-500 dark:text-green-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(event.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No events yet. Create your first event!</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white">Recent Users</h2>
            <Link href="/admin/users">
              <span className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  {u.profileImageUrl ? (
                    <img src={u.profileImageUrl} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No users yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
