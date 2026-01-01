import { Link, useLocation } from "wouter";
import { Home, Flame, Users, Globe, User } from "lucide-react";
import { motion } from "framer-motion";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Flame, label: "Sparks", href: "/sparks" },
    { icon: Users, label: "Hub", href: "/community" },
    { icon: Globe, label: "Missions", href: "/mission" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      <div className="bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-200 px-1 py-2 pb-[max(env(safe-area-inset-bottom),8px)]">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <motion.div 
                  className={`relative flex flex-col items-center justify-center px-2 py-1.5 rounded-lg transition-all duration-200 min-w-[60px] ${isActive ? 'bg-primary/10' : ''}`}
                  whileTap={{ scale: 0.92 }}
                >
                  <div className={`relative ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                    <item.icon 
                      className={`h-5 w-5 transition-all duration-200 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} 
                      fill={isActive ? "currentColor" : "none"}
                      fillOpacity={isActive ? 0.15 : 0}
                    />
                  </div>
                  <span className={`text-[11px] font-semibold mt-0.5 transition-all duration-200 ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute -top-0.5 h-0.5 w-8 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
