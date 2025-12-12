import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import img1 from "@assets/generated_images/group_of_friends_hiking_a_mountain_trail.png";
import img2 from "@assets/generated_images/young_people_at_a_coffee_shop_bible_study.png";
import img3 from "@assets/generated_images/outdoor_acoustic_worship_session.png";
import img4 from "@assets/generated_images/volunteers_packing_food_boxes.png";
import img5 from "@assets/generated_images/urban_street_portrait_of_stylish_youth.png";

// Duplicate images to create a seamless loop
const images = [img1, img2, img3, img4, img5, img1, img2, img3, img4, img5];

export function MarqueeCTA() {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-primary font-bold tracking-wider uppercase text-sm">Join the Movement</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mt-2">
            See What God is Doing <br /> <span className="text-primary">Around the World</span>
          </h2>
        </div>
        <button className="bg-gray-900 text-white font-bold px-8 py-4 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-transform">
          Follow Our Journey <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <div className="flex overflow-hidden">
          <motion.div 
            className="flex gap-6 pl-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 30 
            }}
          >
            {images.map((src, index) => (
              <div 
                key={index} 
                className="hero-bottom-cta-marquee-item flex-shrink-0 w-[300px] md:w-[450px] h-[250px] md:h-[350px] rounded-[30px] overflow-hidden relative group transform-gpu"
                style={{ willChange: "transform" }}
              >
                <img 
                  src={src} 
                  alt={`Marquee item ${index}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
