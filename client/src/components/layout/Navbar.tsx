import { Link, useLocation } from "wouter";
import { Menu, X, Compass, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";

const openAwakeAI = () => window.dispatchEvent(new CustomEvent('openAwakeAI'));

// Brand Assets - HD Logos (278x141 larger versions)
import logoDark from "@assets/Reawakened_278_141_logo_bigger_1767192125280.png";
import logoLight from "@assets/Reawakened_278_141_logo_white_1767192258915.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Pages with genuinely dark hero backgrounds (navy overlays, dark gradients)
  const isDarkHeroPage = ["/outreach", "/mission", "/missions", "/pray", "/give", "/movement", "/sparks", "/vision", "/journeys", "/group-labs", "/coaching-labs"].includes(location) || location.startsWith("/projects/");
  
  // Pages with light hero backgrounds (cream, warm gradients) - use frosted glass
  const isLightHeroPage = ["/", "/about", "/blog", "/community"].includes(location);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine navbar appearance:
  // Scrolled: Always white background with dark logo/text
  // Dark Hero (unscrolled): Navy glass with white logo/text
  // Light Hero (unscrolled): Frosted white glass with dark logo/text
  
  const useDarkTheme = !scrolled && isDarkHeroPage;
  const textColor = useDarkTheme ? "text-white" : "text-gray-900";
  const hoverColor = useDarkTheme ? "hover:text-white hover:bg-white/10" : "hover:text-primary hover:bg-gray-100";
  const currentLogo = useDarkTheme ? logoLight : logoDark;
  
  // Background styles based on state - compact navbar
  const getNavBackground = () => {
    if (scrolled) return 'bg-white/95 backdrop-blur-md shadow-sm py-2';
    if (isDarkHeroPage) return 'bg-[#1a2744]/60 backdrop-blur-xl border-b border-white/10 shadow-lg py-2';
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
              {isAuthenticated && (
                <Link href="/vision">
                  <span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-1`} data-testid="nav-vision">
                    <Compass className="h-3.5 w-3.5" />
                    Vision
                  </span>
                </Link>
              )}
              <Link href="/sparks"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-sparks">Sparks</span></Link>
              <Link href="/community"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-community">Community Hub</span></Link>
              <Link href="/outreach"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-outreach">Outreach</span></Link>
              <Link href="/blog"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-blog">Blog</span></Link>
              <Link href="/about"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-about">About</span></Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={openAwakeAI}
                className={`p-2 rounded-full transition-all ${useDarkTheme ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Awake AI"
                data-testid="button-awake-ai-nav"
              >
                <Bot className="h-5 w-5" />
              </button>
            )}
            <NotificationBell isDark={useDarkTheme} />
            {!isAuthenticated && (
              <Button 
                variant="ghost"
                onClick={() => navigate('/login')}
                className={`${useDarkTheme ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'} font-bold px-4 py-2 rounded-full transition-all`}
                data-testid="nav-signin"
              >
                Sign In
              </Button>
            )}
            <Button 
              onClick={() => navigate(isAuthenticated ? '/missions' : '/outreach')}
              className={`${useDarkTheme ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-white hover:bg-primary/90'} font-bold px-5 py-2 rounded-full shadow-lg transition-all hover:scale-105`}
              data-testid="nav-join"
            >
              {isAuthenticated ? 'My Missions' : 'Join Now'}
            </Button>
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
            className="md:hidden bg-white border-b border-gray-100 shadow-lg"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link href="/"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-home">Home</span></Link>
              {isAuthenticated && (
                <Link href="/vision">
                  <span className="text-gray-800 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-bold cursor-pointer flex items-center gap-2" data-testid="mobile-nav-vision">
                    <Compass className="h-4 w-4 text-[#7C9A8E]" />
                    Vision & Goals
                  </span>
                </Link>
              )}
              <Link href="/sparks"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-sparks">Sparks</span></Link>
              <Link href="/community"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-community">Community Hub</span></Link>
              <Link href="/outreach"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-outreach">Outreach</span></Link>
              <Link href="/blog"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-blog">Blog</span></Link>
              <Link href="/about"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-about">About</span></Link>
              <div className="pt-4 space-y-2">
                {!isAuthenticated && (
                  <Button 
                    variant="outline"
                    onClick={() => { setIsOpen(false); navigate('/login'); }}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-5 rounded-xl" 
                    data-testid="mobile-nav-signin"
                  >
                    Sign In
                  </Button>
                )}
                <Button 
                  onClick={() => { setIsOpen(false); navigate(isAuthenticated ? '/missions' : '/outreach'); }}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl" 
                  data-testid="mobile-nav-join"
                >
                  {isAuthenticated ? 'My Missions' : 'Join the Movement'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
