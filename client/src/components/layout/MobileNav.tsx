import { Link, useLocation } from "wouter";
import { Home, Globe, Flame, Users, BookOpen } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Globe, label: "Mission", href: "/mission" },
    { icon: Flame, label: "Sparks", href: "/sparks" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: BookOpen, label: "Blog", href: "/blog" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex justify-around items-center px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.label} href={item.href}>
              <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'fill-primary/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 h-0.5 w-8 bg-primary rounded-full mt-1" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
