import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Brand Assets
import logoDark from "@assets/1_1765580635080.png";
import logoLight from "@assets/6_1765580635085.png";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // Check if current page has a dark hero section
  const isDarkHeroPage = ["/", "/mission", "/sparks", "/vision"].includes(location);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine which logo and text color to use
  // If scrolled: White background -> Dark Logo, Dark Text
  // If not scrolled & Dark Hero: Transparent background -> Light Logo, Light Text
  // If not scrolled & Light Hero: Transparent background -> Dark Logo, Dark Text
  
  const showDarkNav = scrolled || !isDarkHeroPage;
  const textColor = showDarkNav ? "text-gray-900" : "text-white";
  const hoverColor = showDarkNav ? "hover:text-primary hover:bg-gray-100" : "hover:text-white hover:bg-white/10";
  const currentLogo = showDarkNav ? logoDark : logoLight;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-gradient-to-b from-black/60 to-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/">
              <div className="cursor-pointer">
                <img 
                  src={currentLogo} 
                  alt="The Reawakened One" 
                  className="h-10 w-auto object-contain transition-all duration-300"
                />
              </div>
            </Link>
          </div>
          
          <div className={`hidden md:block px-6 py-2.5 rounded-full border transition-all duration-300 ${scrolled ? 'bg-white/50 border-gray-200' : 'bg-transparent border-transparent'}`}>
            <div className="flex items-baseline space-x-1">
              <Link href="/"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`}>Home</span></Link>
              <Link href="/about"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`}>About</span></Link>
              <Link href="/blog"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`}>Blog</span></Link>
              <Link href="/community"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`}>Community</span></Link>
              <Link href="/sparks"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`}>Sparks</span></Link>
              <Link href="/mission"><span className={`${textColor} ${hoverColor} px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer`}>Mission</span></Link>
            </div>
          </div>

          <div className="hidden md:block">
            <Button className={`${showDarkNav ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-primary hover:bg-gray-100'} font-bold px-6 py-5 rounded-full shadow-lg transition-all hover:scale-105`}>
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
              <Link href="/"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Home</span></Link>
              <Link href="/about"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">About</span></Link>
              <Link href="/blog"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Blog</span></Link>
              <Link href="/community"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Community</span></Link>
              <Link href="/sparks"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Sparks</span></Link>
              <Link href="/mission"><span className="text-gray-800 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Mission</span></Link>
              <div className="pt-4">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-xl">
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
