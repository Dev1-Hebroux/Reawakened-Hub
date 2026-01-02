import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { User, Settings, Award, Heart, Globe, Clock, ChevronRight, LogOut, Bell, Shield, LayoutDashboard } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const stats = [
    { label: "Days Active", value: "12", icon: Clock },
    { label: "Prayers Prayed", value: "47", icon: Heart },
    { label: "Impact Points", value: "320", icon: Award },
  ];

  const menuItems = [
    { label: "My Journey", description: "View your progress", icon: Globe, href: "/vision" },
    { label: "Notifications", description: "Manage alerts", icon: Bell, href: "#" },
    { label: "Privacy & Security", description: "Account settings", icon: Shield, href: "#" },
    { label: "Settings", description: "App preferences", icon: Settings, href: "#" },
    ...(isAdmin ? [{ label: "Admin Portal", description: "Manage platform", icon: LayoutDashboard, href: "/admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#1a2744]">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="h-24 w-24 mx-auto rounded-full bg-[#243656] border-4 border-[#D4A574] flex items-center justify-center mb-4 shadow-xl">
              <User className="h-12 w-12 text-[#D4A574]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">
              Welcome Back
            </h1>
            <p className="text-[#7C9A8E]">
              Sign in to track your journey
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {stats.map((stat, i) => (
              <div 
                key={stat.label}
                className="bg-[#243656] rounded-2xl p-4 border-2 border-[#4A7C7C]/30 shadow-lg text-center"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <stat.icon className="h-5 w-5 text-[#D4A574] mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-[#7C9A8E]">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#243656] rounded-3xl border-2 border-[#4A7C7C]/30 shadow-xl overflow-hidden mb-6"
          >
            {menuItems.map((item, i) => (
              <button
                key={item.label}
                onClick={() => item.href !== "#" && navigate(item.href)}
                className={`w-full flex items-center justify-between p-4 hover:bg-[#1a2744] transition-all ${
                  i !== menuItems.length - 1 ? 'border-b border-[#4A7C7C]/20' : ''
                }`}
                data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1a2744] flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-[#7C9A8E]" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white text-sm">{item.label}</div>
                    <div className="text-xs text-[#7C9A8E]">{item.description}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#4A7C7C]" />
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              className="w-full bg-[#D4A574] hover:bg-[#C49464] text-white font-bold py-6 rounded-2xl shadow-lg mb-4"
              data-testid="button-sign-in"
            >
              Sign In with Replit
            </Button>
            
            <button 
              className="w-full flex items-center justify-center gap-2 text-[#7C9A8E] hover:text-white py-3 transition-all"
              data-testid="button-sign-out"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </motion.div>
          
        </div>
      </main>
    </div>
  );
}
