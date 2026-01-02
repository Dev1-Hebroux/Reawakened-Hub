import { Link, useLocation } from "wouter";
import { Menu, X, Compass, Sparkles, ChevronDown, Target, BookOpen, Map } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";

const openAwakeAI = () => window.dispatchEvent(new CustomEvent('openAwakeAI'));

// Brand Assets - HD Logos (278x141 larger versions)
import logoDark from "@assets/Reawakened_278_141_logo_bigger_1767192125280.png";
import logoLight from "@assets/Reawakened_278_141_logo_white_1767192258915.png";

const pathwayItems = [
  { href: "/vision", label: "Vision & Goals", icon: Target, description: "Design your life vision and set goals", color: "#7C9A8E" },
  { href: "/journeys", label: "Faith Guides", icon: BookOpen, description: "Guided paths to grow in faith", color: "#D4A574" },
  { href: "/pathway", label: "Missionary Pathway", icon: Map, description: "Your journey to global missions", color: "#1a2744" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pathwaysOpen, setPathwaysOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const pathwaysRef = useRef<HTMLDivElement>(null);

  // Close pathways dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pathwaysRef.current && !pathwaysRef.current.contains(event.target as Node)) {
        setPathwaysOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <Link href="/"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-home">Home</span></Link>
              
              {/* Pathways Dropdown */}
              <div className="relative" ref={pathwaysRef}>
                <button
                  onClick={() => setPathwaysOpen(!pathwaysOpen)}
                  className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer inline-flex items-center gap-1`}
                  data-testid="nav-pathways"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Pathways
                  <ChevronDown className={`h-3 w-3 transition-transform ${pathwaysOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {pathwaysOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {pathwayItems.map((item) => (
                          <Link key={item.href} href={item.href}>
                            <div
                              onClick={() => setPathwaysOpen(false)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                              data-testid={`nav-pathway-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div 
                                className="h-10 w-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${item.color}20` }}
                              >
                                <item.icon className="h-5 w-5" style={{ color: item.color }} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.description}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/sparks"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-sparks">Sparks</span></Link>
              <Link href="/community"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-community">Community</span></Link>
              <Link href="/mission"><span className={`${textColor} ${hoverColor} px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer`} data-testid="nav-missions">Missions</span></Link>
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
                <Sparkles className="h-5 w-5" />
              </button>
            )}
            <NotificationBell isDark={useDarkTheme} />
            <Button 
              onClick={() => navigate(isAuthenticated ? '/missions' : '/mission/onboarding')}
              className={`${useDarkTheme ? 'bg-white text-primary hover:bg-gray-100' : 'bg-primary text-white hover:bg-primary/90'} font-bold px-5 py-2 rounded-full shadow-lg transition-all hover:scale-105`}
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
              
              {/* Pathways Section */}
              <div className="py-2">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pathways</p>
                {pathwayItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span 
                      onClick={() => setIsOpen(false)}
                      className="text-gray-800 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium cursor-pointer flex items-center gap-3" 
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div 
                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <item.icon className="h-4 w-4" style={{ color: item.color }} />
                      </div>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>

              <Link href="/sparks"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-sparks">Sparks</span></Link>
              <Link href="/community"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-community">Community</span></Link>
              <Link href="/mission"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-missions">Missions</span></Link>
              <Link href="/blog"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-blog">Blog</span></Link>
              <Link href="/about"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer" data-testid="mobile-nav-about">About</span></Link>
              <div className="pt-4">
                <Button 
                  onClick={() => { setIsOpen(false); navigate(isAuthenticated ? '/missions' : '/mission/onboarding'); }}
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
