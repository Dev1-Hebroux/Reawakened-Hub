import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, MapPin, Share2, MessageCircle, 
  Heart, Play, Globe, X, Send,
  Maximize2, MoreVertical, ArrowRight
} from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";

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

const pillars = ["All", "Outpouring", "Harvest", "Without Walls", "Intercession"];

export function SparksPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSpark, setSelectedSpark] = useState<typeof sparks[0] | null>(null);

  const filteredSparks = activeFilter === "All" 
    ? sparks 
    : sparks.filter(s => s.type === activeFilter);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      
      {/* Hero / Live Now Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={spark1} 
            alt="Live Spark" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex items-end p-6 md:p-12 max-w-7xl mx-auto w-full">
          <div className="w-full md:w-1/2 space-y-4">
             <div className="flex items-center gap-2">
               <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                 <div className="h-2 w-2 bg-white rounded-full" /> LIVE NOW
               </span>
               <span className="bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                 São Paulo, Brazil
               </span>
             </div>
             
             <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
               Street Worship Erupts in Downtown
             </h1>
             
             <p className="text-lg text-white/80 max-w-xl">
               Join 12,000 young people gathering right now to declare Jesus over the city. Miracles are happening!
             </p>
             
             <div className="flex items-center gap-4 pt-4">
               <button 
                 onClick={() => setSelectedSpark(sparks[0])}
                 className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full flex items-center gap-2 transition-all hover:scale-105"
               >
                 <Play className="h-5 w-5 fill-current" /> Watch Live
               </button>
               <div className="flex items-center gap-2 text-sm font-medium">
                 <div className="h-2 w-2 bg-green-500 rounded-full" />
                 1.2k Praying
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Filters */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide gap-4">
          <div className="flex gap-2">
            {pillars.map((pillar) => (
              <button
                key={pillar}
                onClick={() => setActiveFilter(pillar)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeFilter === pillar 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {pillar}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <Globe className="h-4 w-4" /> Global Feed
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Add more mock data by repeating/mapping */}
          {[...filteredSparks, ...filteredSparks].map((spark, i) => (
            <motion.div
              key={`${spark.id}-${i}`}
              layoutId={`spark-${spark.id}-${i}`}
              onClick={() => setSelectedSpark(spark)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-[9/16] rounded-[24px] overflow-hidden bg-gray-900 cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
            >
              <img 
                src={spark.video} 
                alt={spark.description} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              
              {/* Top Meta */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                 <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                   <Flame className="h-3 w-3 text-primary" /> {spark.type}
                 </span>
                 {spark.isLive && (
                   <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md animate-pulse">
                     LIVE
                   </span>
                 )}
              </div>

              {/* Bottom Meta */}
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <div className="flex items-center gap-2 mb-2 text-xs text-white/70">
                  <MapPin className="h-3 w-3" /> {spark.location}
                </div>
                <p className="text-sm font-medium text-white line-clamp-2 mb-3 leading-snug">
                  {spark.description}
                </p>
                <div className="flex items-center justify-between text-xs font-bold text-white/50 border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {spark.likes}</span>
                  <span className="flex items-center gap-1 text-primary"><Flame className="h-3 w-3" /> {spark.prayers} Prayers</span>
                </div>
              </div>

              {/* Hover Play Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <Play className="h-6 w-6 fill-white text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Real-time Ticker */}
        <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-72 shadow-2xl">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /> Global Prayer Pulse
            </h4>
            <div className="space-y-3">
              {[
                { user: "Maria (Brazil)", action: "ignited a spark", time: "just now" },
                { user: "John (UK)", action: "is praying for London", time: "2s ago" },
                { user: "Team Kenya", action: "started a live stream", time: "5s ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className="h-6 w-6 rounded-full bg-white/10 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white">{item.user}</span> <span className="text-gray-400">{item.action}</span>
                    <div className="text-[10px] text-gray-600">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Immersive Overlay Modal */}
      <AnimatePresence>
        {selectedSpark && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setSelectedSpark(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-50"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="w-full max-w-6xl h-full flex flex-col md:flex-row gap-8 items-center justify-center">
              
              {/* Video Player */}
              <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-[30px] overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
                <img src={selectedSpark.video} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                
                {/* Overlay Controls (Simulated) */}
                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-white/20" />
                     <div>
                       <h4 className="font-bold text-white">@{selectedSpark.user}</h4>
                       <p className="text-xs text-white/70">{selectedSpark.location}</p>
                     </div>
                     <button className="ml-auto bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full">Follow</button>
                  </div>
                  <p className="text-sm text-white/90">{selectedSpark.description}</p>
                </div>

                {/* Side Actions */}
                <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center">
                  <div className="text-center space-y-1">
                    <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                      <Heart className="h-6 w-6 fill-white text-white" />
                    </div>
                    <span className="text-xs font-bold">{selectedSpark.likes}</span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                      <Flame className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-bold">{selectedSpark.prayers}</span>
                  </div>
                  <div className="text-center space-y-1">
                     <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors">
                       <Share2 className="h-6 w-6 text-white" />
                     </div>
                     <span className="text-xs font-bold">Share</span>
                  </div>
                </div>
              </div>

              {/* Context / Chat (Desktop Only) */}
              <div className="hidden md:flex flex-col h-[80vh] w-full max-w-md bg-gray-900 rounded-[30px] border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-gray-900">
                  <h3 className="font-bold text-white">Live Intercession</h3>
                  <p className="text-xs text-gray-400">1.2k people praying now</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {[1,2,3,4,5,6].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex-shrink-0" />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-gray-300">User {i}</span>
                          <span className="text-[10px] text-gray-600">2m</span>
                        </div>
                        <p className="text-sm text-gray-400">Amen! Agreeing with this prayer from London. 🔥</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/10 bg-gray-900">
                   <div className="relative">
                     <input 
                       type="text" 
                       placeholder="Add a prayer..." 
                       className="w-full bg-black rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                     />
                     <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-full text-white">
                       <Send className="h-4 w-4" />
                     </button>
                   </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
