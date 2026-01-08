import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Instagram, Youtube, Twitter, Facebook, Mail, MessageCircle, Loader2, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { COMMUNITY_LINKS } from "@/lib/config";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/subscribe", {
        email,
        categories: ["devotional", "events"],
        whatsappOptIn: false,
      });
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Subscribed successfully!");
      setTimeout(() => {
        setIsSuccess(false);
        setEmail("");
      }, 3000);
    },
    onError: () => {
      toast.error("Failed to subscribe. Please try again.");
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    subscribeMutation.mutate(email);
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tighter flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">R</div>
              REAWAKENED
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              A digital missions base empowering a generation to encounter Jesus, grow in discipleship, and transform the world.
            </p>
            <div className="flex space-x-3">
              <a href={COMMUNITY_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" data-testid="link-social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={COMMUNITY_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" data-testid="link-social-youtube">
                <Youtube className="h-5 w-5" />
              </a>
              <a href={COMMUNITY_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" data-testid="link-social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={COMMUNITY_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all" data-testid="link-social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href={COMMUNITY_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all"
                data-testid="link-social-whatsapp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><a href="/sparks" className="hover:text-primary transition-colors" data-testid="link-footer-sparks">Daily Sparks</a></li>
              <li><a href="/reading-plans" className="hover:text-primary transition-colors" data-testid="link-footer-reading-plans">Reading Plans</a></li>
              <li><a href="/community" className="hover:text-primary transition-colors" data-testid="link-footer-community">Community Hub</a></li>
              <li><a href="/vision" className="hover:text-primary transition-colors" data-testid="link-footer-vision">Vision & Goals</a></li>
              <li><a href="/journeys" className="hover:text-primary transition-colors" data-testid="link-footer-journeys">Spiritual Journeys</a></li>
              <li><a href="/blog" className="hover:text-primary transition-colors" data-testid="link-footer-blog">Blog</a></li>
              <li><a href="/mission" className="hover:text-primary transition-colors" data-testid="link-footer-mission">Mission</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Get Involved</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-medium">
              <li><a href="/mission#events" className="hover:text-primary transition-colors" data-testid="link-footer-events">Events</a></li>
              <li><a href="/mission" className="hover:text-primary transition-colors" data-testid="link-footer-volunteer">Volunteer</a></li>
              <li><a href="/mission" className="hover:text-primary transition-colors" data-testid="link-footer-missions">Join a Mission Trip</a></li>
              <li>
                <a 
                  href={COMMUNITY_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-colors inline-flex items-center gap-1"
                  data-testid="link-footer-whatsapp-community"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Community
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6">Stay Connected</h4>
            <p className="text-sm text-gray-500 mb-4">Get mission updates, devotionals, and prayer points delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm flex-1 outline-none focus:border-primary/50"
                data-testid="input-footer-subscribe-email"
              />
              <button 
                type="submit"
                disabled={subscribeMutation.isPending || isSuccess}
                className="bg-primary text-white rounded-xl px-4 py-3 font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
                data-testid="button-footer-subscribe"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isSuccess ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </button>
            </form>
            <a 
              href={COMMUNITY_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              data-testid="link-footer-join-whatsapp"
            >
              <MessageCircle className="h-4 w-4" /> Or join our WhatsApp
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
          <p>&copy; {new Date().getFullYear()} Reawakened Platform. All rights reserved.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900" data-testid="link-footer-privacy">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900" data-testid="link-footer-terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
