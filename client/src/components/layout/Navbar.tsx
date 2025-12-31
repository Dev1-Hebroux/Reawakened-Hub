import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Brand Assets - HD Logos (278x141 larger versions)
import logoDark from "@assets/Reawakened_278_141_logo_bigger_1767192125280.png";
import logoLight from "@assets/Reawakened_278_141_logo_white_1767192258915.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // Pages with genuinely dark hero backgrounds (navy overlays, dark gradients)
  const isDarkHeroPage = ["/mission", "/missions", "/pray", "/give", "/movement", "/sparks", "/vision", "/journeys", "/group-labs", "/coaching-labs"].includes(location) || location.startsWith("/projects/");
  
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
  
  // Background styles based on state
  const getNavBackground = () => {
    if (scrolled) return 'bg-white/95 backdrop-blur-md shadow-sm py-4';
    if (isDarkHeroPage) return 'bg-[#1a2744]/60 backdrop-blur-xl border-b border-white/10 shadow-lg py-5';
    return 'bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-5';
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
                  className="h-16 md:h-20 w-auto object-contain transition-all duration-300 drop-shadow-lg"
                />
              </div>
            </Link>
          </div>
          
          <div className={`hidden md:block px-6 py-2.5 rounded-full border transition-all duration-300 ${scrolled ? 'bg-white/50 border-gray-200' : 'bg-transparent border-transparent'}`}>
            <div className="flex items-baseline space-x-1">
              <Link href="/"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-home">Home</span></Link>
              <Link href="/pray"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-pray">Pray</span></Link>
              <Link href="/missions"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-missions">Missions</span></Link>
              <Link href="/give"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-give">Give</span></Link>
              <Link href="/movement"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-movement">Movement</span></Link>
              <Link href="/about"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-about">About</span></Link>
            </div>
          </div>

          <div className="hidden md:block">
            <Button className={`${useDarkTheme ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-white hover:bg-primary/90'} font-bold px-6 py-5 rounded-full shadow-lg transition-all hover:scale-105`}>
              Join Now
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
              <Link href="/pray"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-pray">Pray</span></Link>
              <Link href="/missions"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-missions">Missions</span></Link>
              <Link href="/give"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-give">Give</span></Link>
              <Link href="/movement"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-movement">Movement</span></Link>
              <Link href="/about"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-about">About</span></Link>
              <div className="pt-4">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl" data-testid="mobile-nav-join">
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
