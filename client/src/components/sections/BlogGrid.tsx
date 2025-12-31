import { motion, AnimatePresence } from "framer-motion";
import { Clock, Eye, Heart, Share2, ArrowRight, PlayCircle, Mic, Loader2, X, Copy, Check, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { BlogPost } from "@shared/schema";
import { toast } from "sonner";

// Social share icons as SVG components
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Share dropdown component
function ShareDropdown({ post, isOpen, onClose }: { post: BlogPost; isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const postUrl = `${window.location.origin}/blog/${post.slug}`;
  const shareText = `Check out: ${post.title}`;

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + postUrl)}`, "_blank");
        onClose();
      }
    },
    {
      name: "Twitter",
      icon: TwitterIcon,
      color: "bg-black hover:bg-gray-800",
      onClick: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, "_blank");
        onClose();
      }
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, "_blank");
        onClose();
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-900">Share this post</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-close-share"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex gap-2 mb-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.onClick}
              className={`${option.color} text-white p-2.5 rounded-full transition-all hover:scale-110`}
              data-testid={`button-share-${option.name.toLowerCase()}-${post.id}`}
              title={`Share on ${option.name}`}
            >
              <option.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        
        <button
          onClick={copyToClipboard}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium transition-all text-sm"
          data-testid={`button-copy-link-${post.id}`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
import img1 from "@assets/generated_images/concert_crowd_with_hands_raised_in_worship.png";
import img2 from "@assets/generated_images/open_bible_on_a_cafe_table_with_coffee.png";
import img3 from "@assets/generated_images/backpacker_overlooking_a_landscape.png";
import img4 from "@assets/generated_images/group_discussion_in_a_living_room.png";

const categories = ["All", "Faith & Culture", "Mission Life", "Relationships", "Worship"];

const defaultImages = [img1, img2, img3, img4];

function getDefaultImage(index: number) {
  return defaultImages[index % defaultImages.length];
}

function formatDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BlogGrid() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openShareId, setOpenShareId] = useState<number | null>(null);
  
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <span className="text-primary font-bold tracking-wider uppercase text-sm">The Blog</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mt-2">
              Stories of <span className="text-primary">Transformation</span>
            </h2>
          </div>
          
          <div className="flex overflow-x-auto pb-2 gap-2 w-full md:w-auto scrollbar-hide">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-testid={`button-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured Post (Hero Style) - First post */}
            {filteredPosts.length > 0 && (
              <div className="mb-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative rounded-[40px] overflow-hidden aspect-[16/9] md:aspect-[21/9] cursor-pointer"
                  data-testid={`card-blog-featured-${filteredPosts[0].id}`}
                >
                  <img 
                    src={filteredPosts[0].coverImageUrl || getDefaultImage(0)} 
                    alt={filteredPosts[0].title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
                      <span className="text-white/80 text-sm font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> 10 min read</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                      {filteredPosts[0].title}
                    </h3>
                    <p className="text-white/80 text-lg mb-6 line-clamp-2">
                      {filteredPosts[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white" />
                        <span className="text-white font-bold">{filteredPosts[0].category}</span>
                      </div>
                      <Link href={`/blog/${filteredPosts[0].slug}`}>
                        <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2" data-testid="button-read-featured">
                          Read Article <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenShareId(openShareId === filteredPosts[0].id ? null : filteredPosts[0].id);
                          }}
                          className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full font-bold hover:bg-white hover:text-black transition-all"
                          data-testid="button-share-featured"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                        <ShareDropdown 
                          post={filteredPosts[0]} 
                          isOpen={openShareId === filteredPosts[0].id} 
                          onClose={() => setOpenShareId(null)} 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Post Grid - Rest of posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.slice(1).map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[30px] p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  data-testid={`card-blog-${post.id}`}
                >
                  <div className="relative rounded-[20px] overflow-hidden aspect-[16/10] mb-6">
                    <img 
                      src={post.coverImageUrl || getDefaultImage(i + 1)} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                      {post.category}
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md h-10 w-10 rounded-full flex items-center justify-center text-white">
                      <ArrowRight className="h-5 w-5 -rotate-45" />
                    </div>
                  </div>

                  <div className="px-2 pb-4">
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>5 min</span>
                    </div>
                    
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 mb-6 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100" />
                        <span className="text-sm font-bold text-gray-700">{post.category}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400">
                        <button className="hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold" data-testid={`button-like-${post.id}`}>
                          <Heart className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenShareId(openShareId === post.id ? null : post.id);
                            }}
                            className={`hover:text-blue-500 transition-colors ${openShareId === post.id ? 'text-blue-500' : ''}`}
                            data-testid={`button-share-${post.id}`}
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <ShareDropdown 
                            post={post} 
                            isOpen={openShareId === post.id} 
                            onClose={() => setOpenShareId(null)} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {filteredPosts.length > 4 && (
          <div className="mt-16 text-center">
            <button className="btn-primary" data-testid="button-load-more">
              Load More Stories
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
