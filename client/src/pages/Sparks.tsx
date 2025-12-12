import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, MapPin, Share2, MessageCircle, 
  Heart, Play, Globe, X, Send,
  Maximize2, MoreVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Assets
import spark1 from "@assets/generated_images/raw_street_worship_in_brazil.png";
import spark2 from "@assets/generated_images/testimony_of_healing_in_a_village.png";
import spark3 from "@assets/generated_images/underground_prayer_meeting.png";
import spark4 from "@assets/generated_images/student_sharing_gospel_on_campus.png";

const sparks = [
  {
    id: 1,
    type: "Outpouring",
    location: "São Paulo, Brazil",
    user: "Mateus Silva",
    description: "The Holy Spirit broke out on the streets tonight! No stage, just hunger. 🔥🇧🇷 #Revival #StreetWorship",
    video: spark1,
    likes: "12.5k",
    prayers: "4.2k",
    isLive: true
  },
  {
    id: 2,
    type: "Harvest",
    location: "Nairobi, Kenya",
    user: "Sarah Mission",
    description: "She couldn't walk without pain for 10 years. Jesus healed her instantly! The village is listening. 🙌🏾 #Miracles #Harvest",
    video: spark2,
    likes: "8.9k",
    prayers: "2.1k",
    isLive: false
  },
  {
    id: 3,
    type: "Without Walls",
    location: "University of Oxford, UK",
    user: "Campus Fire",
    description: "Boldness rising! Preaching the simple gospel on the quad. Students are stopping to hear. Pray for harvest! 🇬🇧",
    video: spark4,
    likes: "5.6k",
    prayers: "1.8k",
    isLive: false
  },
  {
    id: 4,
    type: "Intercession",
    location: "Underground Location",
    user: "Hidden Watchmen",
    description: " contending for the nation. We will not stop until we see the rain. 🌧️ #Prayer #Watchmen",
    video: spark3,
    likes: "3.2k",
    prayers: "8.5k",
    isLive: false
  }
];

export function SparksPage() {
  const [activeSpark, setActiveSpark] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Simulate auto-scroll or just interaction logic
  const handleNext = () => {
    setActiveSpark((prev) => (prev + 1) % sparks.length);
  };

  const handlePrev = () => {
    setActiveSpark((prev) => (prev - 1 + sparks.length) % sparks.length);
  };

  const current = sparks[activeSpark];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Immersive Container */}
      <div className="flex-1 relative pt-20 flex justify-center items-center bg-[#0a0a0a]">
        
        {/* Background Blur */}
        <div className="absolute inset-0 z-0">
          <img 
            src={current.video} 
            alt="Blur BG" 
            className="w-full h-full object-cover opacity-20 blur-3xl scale-125 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Main Feed Content */}
        <div className="relative z-10 w-full max-w-md h-[85vh] md:h-[800px] flex flex-col md:rounded-[30px] overflow-hidden shadow-2xl bg-black border border-white/10">
          
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 z-30 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Flame className="h-3 w-3" /> {current.type}
                </span>
                {current.isLive && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-white/80 text-xs font-medium">
                <MapPin className="h-3 w-3" /> {current.location}
              </div>
            </div>
            <Globe className="h-6 w-6 text-white/50" />
          </div>

          {/* Video Area */}
          <div className="relative flex-1 bg-gray-900 overflow-hidden group cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
            <img 
              src={current.video} 
              alt="Spark Video" 
              className="w-full h-full object-cover"
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-16 w-16 text-white/80 fill-white/80" />
              </div>
            )}
            
            {/* Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-30">
               <div className="flex flex-col items-center gap-1">
                 <div className="h-12 w-12 rounded-full bg-gray-800/60 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors border border-white/10">
                   <Flame className="h-6 w-6 text-white" />
                 </div>
                 <span className="text-xs font-bold">{current.likes}</span>
               </div>
               
               <div className="flex flex-col items-center gap-1">
                 <div className="h-12 w-12 rounded-full bg-gray-800/60 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-blue-500/80 transition-colors border border-white/10">
                   <MessageCircle className="h-6 w-6 text-white" />
                 </div>
                 <span className="text-xs font-bold">Chat</span>
               </div>

               <div className="flex flex-col items-center gap-1">
                 <div className="h-12 w-12 rounded-full bg-gray-800/60 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-green-500/80 transition-colors border border-white/10">
                   <Share2 className="h-6 w-6 text-white" />
                 </div>
                 <span className="text-xs font-bold">Ignite</span>
               </div>

               <div className="h-10 w-10 rounded-full bg-gray-800/60 backdrop-blur-md flex items-center justify-center cursor-pointer mt-2">
                 <MoreVertical className="h-5 w-5 text-white" />
               </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black via-black/60 to-transparent z-20">
              <div className="pr-16">
                <h3 className="text-lg font-bold text-white mb-2">@{current.user}</h3>
                <p className="text-sm text-white/90 leading-relaxed mb-4">
                  {current.description}
                </p>
                
                {/* Rolling Ticker / Music */}
                <div className="flex items-center gap-2 text-xs text-white/70 overflow-hidden">
                   <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
                     <div className="h-1 w-1 bg-white rounded-full animate-ping" />
                   </div>
                   <div className="whitespace-nowrap animate-marquee">
                     Original Audio • Spirit Break Out (Live) • Reawakened Worship
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Controls (Desktop) */}
          <div className="hidden md:flex absolute top-1/2 -left-16 -right-16 justify-between pointer-events-none px-4">
             <button onClick={handlePrev} className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 text-white transition-all">
               <span className="text-2xl">←</span>
             </button>
             <button onClick={handleNext} className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 text-white transition-all">
               <span className="text-2xl">→</span>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
