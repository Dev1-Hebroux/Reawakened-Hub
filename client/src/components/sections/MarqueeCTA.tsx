import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import img1 from "@assets/generated_images/group_of_friends_hiking_a_mountain_trail.png";
import img2 from "@assets/generated_images/young_people_at_a_coffee_shop_bible_study.png";
import img3 from "@assets/generated_images/outdoor_acoustic_worship_session.png";
import img4 from "@assets/generated_images/volunteers_packing_food_boxes.png";
import img5 from "@assets/generated_images/urban_street_portrait_of_stylish_youth.png";

// Duplicate images to create a seamless loop
const images = [img1, img2, img3, img4, img5, img1, img2, img3, img4, img5];

export function MarqueeCTA() {
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call for newsletter subscription
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate successful subscription
          resolve(true);
        }, 1000);
      });
      
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("You're now following our journey!");
      
      // Redirect to missions page after 2 seconds only on success
      setTimeout(() => {
        setShowModal(false);
        navigate("/mission");
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="text-primary font-bold tracking-wider uppercase text-sm">Join the Movement</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mt-2">
            See What God is Doing <br /> <span className="text-primary">Around the World</span>
          </h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gray-900 text-white font-bold px-8 py-4 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-transform"
          data-testid="button-follow-journey"
        >
          Follow Our Journey <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Newsletter Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => !isSubmitting && setShowModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>

              {!isSuccess ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#7C9A8E] to-[#4A7C7C] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Follow Our Journey</h3>
                    <p className="text-gray-600 text-sm">
                      Get inspiring stories, mission updates, and testimonials from our global community delivered to your inbox.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C9A8E]/30 focus:border-[#7C9A8E]"
                        data-testid="input-newsletter-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C9A8E]/30 focus:border-[#7C9A8E]"
                        data-testid="input-newsletter-email"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#7C9A8E] text-white font-bold py-4 rounded-full hover:bg-[#6B8B7E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                      data-testid="button-subscribe"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Join the Movement
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">You're In!</h3>
                  <p className="text-gray-600">
                    Redirecting you to see what God is doing around the world...
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
