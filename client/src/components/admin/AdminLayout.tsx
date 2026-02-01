import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, Users, FileText, Target, Trophy, 
  Map, BarChart3, Compass, GraduationCap, Menu, X,
  ChevronRight, ChevronDown, LogOut, Settings, Home,
  Flame, Calendar, MessageSquare, BookOpen, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@shared/schema";

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items?: NavItem[];
  href?: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ElementType;
}

const navSections: NavSection[] = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/admin/dashboard" 
  },
  { 
    id: "users", 
    label: "Users", 
    icon: Users, 
    href: "/admin/users"
  },
  { 
    id: "content", 
    label: "Content", 
    icon: FileText, 
    items: [
      { id: "sparks", label: "Sparks", href: "/admin/sparks", icon: Flame },
      { id: "blog", label: "Blog Posts", href: "/admin/blog", icon: BookOpen },
      { id: "events", label: "Events", href: "/admin/events", icon: Calendar },
    ]
  },
  { 
    id: "challenges", 
    label: "Challenges", 
    icon: Trophy, 
    href: "/admin/challenges"
  },
  { 
    id: "missions", 
    label: "Mission Control", 
    icon: Map, 
    href: "/admin/missions"
  },
  { 
    id: "coaching", 
    label: "Coaching", 
    icon: GraduationCap, 
    href: "/admin/coaching"
  },
  { 
    id: "community", 
    label: "Community", 
    icon: Heart, 
    items: [
      { id: "prayer", label: "Prayer Dashboard", href: "/admin/prayer" },
      { id: "moderation", label: "Moderation", href: "/admin/moderation" },
      { id: "funnels", label: "Funnels", href: "/admin/funnels" },
    ]
  },
  { 
    id: "analytics", 
    label: "Analytics", 
    icon: BarChart3, 
    href: "/admin/analytics"
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AdminLayout({ children, title, subtitle, actions, breadcrumbs }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["content", "users", "community"]);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth() as { user: User | null; isAuthenticated: boolean };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getRoleBadgeColor = (role?: string | null) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'leader': return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const isActiveLink = (href: string) => {
    return location === href || (href !== "/admin/dashboard" && location.startsWith(href));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4" data-testid="admin-login-prompt">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#1a2744]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-[#1a2744]" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard.</p>
          <Button 
            onClick={() => window.location.href = "/login"}
            className="w-full bg-[#1a2744] hover:bg-[#1a2744]/90"
            data-testid="button-admin-login"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <Link href="/">
          <span className="text-xl font-display font-bold cursor-pointer text-white" data-testid="link-admin-home">Reawakened</span>
        </Link>
        <Badge className="ml-2 bg-[#7C9A8E]/30 text-[#7C9A8E] border-[#7C9A8E]/50 text-xs">Admin</Badge>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" data-testid="admin-nav">
        {navSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const hasItems = section.items && section.items.length > 0;
          const isActive = section.href ? isActiveLink(section.href) : false;
          const hasActiveChild = section.items?.some(item => isActiveLink(item.href));

          if (!hasItems && section.href) {
            return (
              <Link key={section.id} href={section.href}>
                <span 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    isActive 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  data-testid={`nav-link-${section.id}`}
                >
                  <section.icon className="h-5 w-5" />
                  {section.label}
                </span>
              </Link>
            );
          }

          return (
            <Collapsible 
              key={section.id} 
              open={isExpanded}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    hasActiveChild 
                      ? "bg-white/10 text-white" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  data-testid={`nav-section-${section.id}`}
                >
                  <section.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{section.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 mt-1 space-y-1">
                {section.items?.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <span 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                        isActiveLink(item.href)
                          ? "bg-white/10 text-white font-medium" 
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`nav-link-${item.id}`}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2" data-testid="admin-user-info">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="h-9 w-9 rounded-full" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[#7C9A8E]/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-[#7C9A8E]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" data-testid="text-admin-username">
              {user?.firstName || "Admin"} {user?.lastName || ""}
            </p>
            <Badge 
              variant="outline" 
              className={`text-[10px] px-1.5 py-0 ${getRoleBadgeColor(user?.role)}`}
              data-testid="badge-admin-role"
            >
              {user?.role?.replace('_', ' ') || 'member'}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex" data-testid="admin-layout">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#1a2744]" data-testid="admin-sidebar-desktop">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="admin-sidebar-overlay"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#1a2744] z-50 lg:hidden flex flex-col"
              data-testid="admin-sidebar-mobile"
            >
              <div className="absolute right-2 top-2">
                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-lg text-white"
                  data-testid="button-close-sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 min-h-16 py-3 px-4 lg:px-8" data-testid="admin-header">
          <div className="flex items-start gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg shrink-0 mt-0.5"
              data-testid="button-open-sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm text-gray-500 mb-0.5 flex-wrap" data-testid="admin-breadcrumbs">
                  <Link href="/admin/dashboard">
                    <span className="hover:text-gray-700 cursor-pointer flex items-center gap-1">
                      <Home className="h-3.5 w-3.5" />
                      Admin
                    </span>
                  </Link>
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <ChevronRight className="h-3.5 w-3.5" />
                      {crumb.href ? (
                        <Link href={crumb.href}>
                          <span className="hover:text-gray-700 cursor-pointer">{crumb.label}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-700 font-medium">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
              <h1 className="text-lg sm:text-xl font-display font-bold text-gray-900 truncate" data-testid="text-page-title">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-gray-500 truncate" data-testid="text-page-subtitle">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {actions}
              <Link href="/">
                <Button variant="outline" size="sm" className="hidden sm:flex" data-testid="button-exit-admin">
                  <LogOut className="h-4 w-4 mr-2" /> Exit Admin
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8" data-testid="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
