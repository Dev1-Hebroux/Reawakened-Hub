import { Link, useLocation } from "wouter";
import { Menu, X, User, Settings, LogOut, LayoutDashboard, Target, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logoDark from "@assets/Reawakened_278_141_logo_bigger_1767192125280.png";
import logoLight from "@assets/Reawakened_278_141_logo_white_1767192258915.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated } = useAuth() as { user: any; isAuthenticated: boolean };

  const isDarkHeroPage = ["/mission", "/missions", "/pray", "/give", "/movement", "/sparks", "/vision", "/journeys", "/group-labs", "/coaching-labs"].includes(location) || location.startsWith("/projects/");
  const isLightHeroPage = ["/", "/about", "/blog", "/community"].includes(location);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDarkMode = mounted && resolvedTheme === "dark";
  const useDarkTheme = !scrolled && (isDarkHeroPage || isDarkMode);
  const textColor = useDarkTheme ? "text-white" : "text-gray-900 dark:text-gray-100";
  const hoverColor = useDarkTheme ? "hover:text-white hover:bg-white/10" : "hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800";
  const currentLogo = useDarkTheme ? logoLight : (isDarkMode ? logoLight : logoDark);
  
  const getNavBackground = () => {
    if (scrolled) return 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm py-2';
    if (isDarkHeroPage) return 'bg-[#1a2744]/60 backdrop-blur-xl border-b border-white/10 shadow-lg py-2';
    if (isDarkMode) return 'bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-lg py-2';
    return 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-2';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavBackground()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="cursor-pointer">
                <img 
                  src={currentLogo} 
                  alt="The Reawakened One" 
                  className="h-10 md:h-12 w-auto object-contain transition-all duration-300 drop-shadow-lg"
                />
              </div>
            </Link>
          </div>
          
          <div className={`hidden md:block px-4 py-1.5 rounded-full border transition-all duration-300 ${scrolled ? 'bg-white/50 border-gray-200' : 'bg-transparent border-transparent'}`}>
            <div className="flex items-baseline space-x-0.5">
              <Link href="/"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-home">Home</span></Link>
              <Link href="/sparks"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-sparks">Sparks</span></Link>
              <Link href="/community"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-community">Community Hub</span></Link>
              <Link href="/vision"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-vision">Vision & Goals</span></Link>
              <Link href="/mission"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-missions">Missions</span></Link>
              <Link href="/blog"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-blog">Blog</span></Link>
              <Link href="/about"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-about">About</span></Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle className={useDarkTheme ? "text-white hover:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-gray-800"} />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${useDarkTheme ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${useDarkTheme ? 'bg-white/20' : 'bg-primary/10'}`}>
                        <User className={`h-4 w-4 ${useDarkTheme ? 'text-white' : 'text-primary'}`} />
                      </div>
                    )}
                    <span className={`font-medium text-sm ${textColor}`}>{user?.firstName || 'User'}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/goals')} data-testid="menu-goals">
                    <Target className="h-4 w-4 mr-2" />
                    Goals & Resolutions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/resources')} data-testid="menu-resources">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Resources
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="menu-admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Portal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/api/logout'} data-testid="menu-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/mission/onboarding')}
                className={`${useDarkTheme ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-white hover:bg-primary/90'} font-bold px-5 py-2 rounded-full shadow-lg transition-all hover:scale-105`}
              >
                Join Now
              </Button>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${textColor}`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link href="/"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-home">Home</span></Link>
              <Link href="/sparks"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-sparks">Sparks</span></Link>
              <Link href="/community"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-community">Community Hub</span></Link>
              <Link href="/vision"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-vision">Vision & Goals</span></Link>
              <Link href="/mission"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-missions">Missions</span></Link>
              <Link href="/blog"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-blog">Blog</span></Link>
              <Link href="/about"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-about">About</span></Link>
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
                  <Link href="/dashboard"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-dashboard">Dashboard</span></Link>
                  <Link href="/goals"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-goals">Goals & Resolutions</span></Link>
                  <Link href="/resources"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-resources">Resources</span></Link>
                  <Link href="/profile"><span className="text-gray-800 dark:text-gray-100 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-profile">Profile</span></Link>
                  <Link href="/admin"><span className="text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer" data-testid="mobile-nav-admin">Admin Portal</span></Link>
                </>
              )}
              
              <div className="pt-4 flex items-center gap-3">
                <ThemeToggle className="flex-shrink-0" />
                {isAuthenticated ? (
                  <Button 
                    onClick={() => { setIsOpen(false); window.location.href = '/api/logout'; }}
                    variant="outline"
                    className="flex-1 py-6 rounded-xl font-bold" 
                    data-testid="mobile-nav-logout"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    onClick={() => { setIsOpen(false); navigate('/mission/onboarding'); }}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl" 
                    data-testid="mobile-nav-join"
                  >
                    Join the Movement
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
