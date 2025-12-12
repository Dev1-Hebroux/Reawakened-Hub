import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/">
              <span className={`text-2xl font-display font-bold tracking-tighter cursor-pointer flex items-center gap-2 ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">R</div>
                REAWAKENED
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block bg-white/80 backdrop-blur-sm px-6 py-2.5 rounded-full border border-gray-100 shadow-sm">
            <div className="flex items-baseline space-x-1">
              <Link href="/"><span className="text-gray-600 hover:text-primary px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer hover:bg-orange-50">Home</span></Link>
              <Link href="#sparks"><span className="text-gray-600 hover:text-primary px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer hover:bg-orange-50">Sparks</span></Link>
              <Link href="#community"><span className="text-gray-600 hover:text-primary px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer hover:bg-orange-50">Community</span></Link>
              <Link href="#mission"><span className="text-gray-600 hover:text-primary px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer hover:bg-orange-50">Mission</span></Link>
            </div>
          </div>

          <div className="hidden md:block">
            <Button className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-5 rounded-full shadow-lg transition-all hover:scale-105">
              Join Now
            </Button>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
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
              <Link href="/"><span className="text-gray-800 hover:text-primary hover:bg-orange-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Home</span></Link>
              <Link href="#sparks"><span className="text-gray-800 hover:text-primary hover:bg-orange-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Sparks</span></Link>
              <Link href="#community"><span className="text-gray-800 hover:text-primary hover:bg-orange-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Community</span></Link>
              <Link href="#mission"><span className="text-gray-800 hover:text-primary hover:bg-orange-50 block px-3 py-2 rounded-lg text-base font-bold cursor-pointer">Mission</span></Link>
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
