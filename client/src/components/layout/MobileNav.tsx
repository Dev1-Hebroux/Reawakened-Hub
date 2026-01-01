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
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100/50 dark:border-gray-700/50 px-2 py-3">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <motion.div 
                  className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 min-w-[56px] ${isActive ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`relative ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                    <item.icon 
                      className={`h-6 w-6 transition-all duration-300 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} 
                      fill={isActive ? "currentColor" : "none"}
                      fillOpacity={isActive ? 0.15 : 0}
                    />
                  </div>
                  <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 h-1 w-6 bg-primary rounded-full"
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
