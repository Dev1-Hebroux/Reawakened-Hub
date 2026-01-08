import { motion } from "framer-motion";
import { Play, Heart, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Spark } from "@shared/schema";

import identityImg from "@assets/generated_images/identity_in_chaos_abstract.png";
import believeImg from "@assets/generated_images/why_i_believe_abstract.png";
import hearingImg from "@assets/generated_images/hearing_god's_voice_abstract.png";
import boldnessImg from "@assets/generated_images/boldness_at_work_abstract.png";

const fallbackImages = [identityImg, believeImg, hearingImg, boldnessImg];

interface DailySparksProps {
  compact?: boolean;
}

export function DailySparks({ compact = false }: DailySparksProps) {
  const { data: sparks, isLoading, error } = useQuery<Spark[]>({
    queryKey: ["/api/sparks/featured"],
    staleTime: 1000 * 60 * 5,
  });

  const displaySparks = sparks?.slice(0, compact ? 1 : 4) || [];

  if (compact) {
    return (
      <div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error || displaySparks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">New devotionals coming soon!</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="group cursor-pointer"
            data-testid={`card-spark-featured-${displaySparks[0].id}`}
          >
            <Link href={`/sparks/${displaySparks[0].id}`}>
              <div className="relative rounded-[24px] overflow-hidden aspect-square max-w-[280px] shadow-lg group-hover:shadow-xl transition-all duration-300">
                <img 
                  src={displaySparks[0].thumbnailUrl || fallbackImages[0]} 
                  alt={displaySparks[0].title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/70 via-transparent to-transparent opacity-70" />
                
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <span className="text-xs font-bold text-white capitalize">Daily Devotional</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-white font-display font-bold text-lg drop-shadow-lg">
                    {displaySparks[0].thumbnailText || displaySparks[0].title}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-14 w-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                    <Play className="h-6 w-6 text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 max-w-[280px]">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{displaySparks[0].title}</h3>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <section id="sparks" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
            <span className="text-primary font-bold tracking-wider uppercase text-sm">Daily Inspiration</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
              Ignite Your <br /><span className="text-primary">Spiritual Journey</span>
            </h2>
          </div>
          <Link href="/sparks">
            <button 
              data-testid="button-view-all-sparks"
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-colors"
            >
              View All Sparks <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || displaySparks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">New devotionals coming soon. Check back for daily inspiration!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displaySparks.map((spark, i) => (
              <motion.div
                key={spark.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                data-testid={`card-spark-${spark.id}`}
              >
                <Link href={`/sparks/${spark.id}`}>
                  <div className="relative rounded-[24px] overflow-hidden aspect-[3/4] mb-4 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={spark.thumbnailUrl || fallbackImages[i % fallbackImages.length]} 
                      alt={spark.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/60 via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      <span className="text-xs font-bold text-white capitalize">{spark.category.replace('-', ' ')}</span>
                    </div>

                    {spark.thumbnailText && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-white font-display font-bold text-lg drop-shadow-lg">{spark.thumbnailText}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="h-14 w-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                        <Play className="h-6 w-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{spark.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                      <span>{spark.weekTheme || spark.category}</span>
                      {spark.duration && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {Math.floor(spark.duration / 60)}:{String(spark.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
