import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import logoDark from "@assets/Reawakened_278_141_logo_bigger_1767192125280.png";
import logoLight from "@assets/Reawakened_278_141_logo_white_1767192258915.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  const isDarkHeroPage = ["/", "/mission", "/missions", "/pray", "/give", "/movement", "/sparks", "/vision", "/journeys", "/group-labs", "/coaching-labs", "/start-mission"].includes(location) || location.startsWith("/projects/");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useDarkTheme = !scrolled && isDarkHeroPage;
  const textColor = useDarkTheme ? "text-white/90" : "text-gray-700";
  const hoverColor = useDarkTheme ? "hover:text-white" : "hover:text-primary";
  const currentLogo = useDarkTheme ? logoLight : logoDark;
  
  const getNavBackground = () => {
    if (scrolled) return 'bg-white/95 backdrop-blur-md shadow-sm py-2';
    if (isDarkHeroPage) return 'bg-transparent py-3';
    return 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-3';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavBackground()}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="cursor-pointer">
                <img 
                  src={currentLogo} 
                  alt="Reawakened" 
                  className="h-10 w-auto object-contain transition-all duration-300"
                />
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/"><span className={`${textColor} ${hoverColor} px-3 py-1.5 text-sm font-medium transition-all cursor-pointer`} data-testid="nav-home">Home</span></Link>
            <Link href="/pray"><span className={`${textColor} ${hoverColor} px-3 py-1.5 text-sm font-medium transition-all cursor-pointer`} data-testid="nav-pray">Pray</span></Link>
            <Link href="/missions"><span className={`${textColor} ${hoverColor} px-3 py-1.5 text-sm font-medium transition-all cursor-pointer`} data-testid="nav-missions">Missions</span></Link>
            <Link href="/give"><span className={`${textColor} ${hoverColor} px-3 py-1.5 text-sm font-medium transition-all cursor-pointer`} data-testid="nav-give">Give</span></Link>
            <Link href="/movement"><span className={`${textColor} ${hoverColor} px-3 py-1.5 text-sm font-medium transition-all cursor-pointer`} data-testid="nav-movement">Movement</span></Link>
            <Link href="/about"><span className={`${textColor} ${hoverColor} px-3 py-1.5 text-sm font-medium transition-all cursor-pointer`} data-testid="nav-about">About</span></Link>
          </div>

          <div className="hidden md:block">
            <Button className={`${useDarkTheme ? 'bg-primary text-white hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'} font-medium px-5 py-2 h-9 rounded-full text-sm`}>
              Join Now
            </Button>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${textColor}`}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            <div className="px-4 py-3 space-y-1">
              <Link href="/"><span className="text-gray-800 hover:text-primary block px-3 py-2 text-sm font-medium cursor-pointer" data-testid="mobile-nav-home">Home</span></Link>
              <Link href="/pray"><span className="text-gray-800 hover:text-primary block px-3 py-2 text-sm font-medium cursor-pointer" data-testid="mobile-nav-pray">Pray</span></Link>
              <Link href="/missions"><span className="text-gray-800 hover:text-primary block px-3 py-2 text-sm font-medium cursor-pointer" data-testid="mobile-nav-missions">Missions</span></Link>
              <Link href="/give"><span className="text-gray-800 hover:text-primary block px-3 py-2 text-sm font-medium cursor-pointer" data-testid="mobile-nav-give">Give</span></Link>
              <Link href="/movement"><span className="text-gray-800 hover:text-primary block px-3 py-2 text-sm font-medium cursor-pointer" data-testid="mobile-nav-movement">Movement</span></Link>
              <Link href="/about"><span className="text-gray-800 hover:text-primary block px-3 py-2 text-sm font-medium cursor-pointer" data-testid="mobile-nav-about">About</span></Link>
              <div className="pt-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg text-sm" data-testid="mobile-nav-join">
                  Join the Movement
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
