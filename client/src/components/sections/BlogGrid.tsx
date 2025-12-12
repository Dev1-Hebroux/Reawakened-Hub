import { motion } from "framer-motion";
import { Clock, Eye, Heart, Share2, ArrowRight, PlayCircle, Mic } from "lucide-react";
import { Link } from "wouter";
import img1 from "@assets/generated_images/concert_crowd_with_hands_raised_in_worship.png";
import img2 from "@assets/generated_images/open_bible_on_a_cafe_table_with_coffee.png";
import img3 from "@assets/generated_images/backpacker_overlooking_a_landscape.png";
import img4 from "@assets/generated_images/group_discussion_in_a_living_room.png";

const categories = ["All", "Faith & Culture", "Mission Life", "Relationships", "Worship"];

const posts = [
  {
    id: 1,
    title: "Why Worship Matters in a Digital Age",
    excerpt: "Disconnecting to reconnect. How meaningful worship shifts our perspective in a noisy world.",
    category: "Worship",
    author: "Sarah Jenkins",
    date: "Oct 12, 2025",
    readTime: "5 min",
    views: "1.2k",
    image: img1,
    type: "article"
  },
  {
    id: 2,
    title: "How to Read the Bible Without Getting Bored",
    excerpt: "Scripture wasn't meant to be dry. Discover 3 methods to make the text come alive today.",
    category: "Faith & Culture",
    author: "Mike Ross",
    date: "Oct 10, 2025",
    readTime: "8 min",
    views: "3.4k",
    image: img2,
    type: "video"
  },
  {
    id: 3,
    title: "My First Solo Mission Trip: What I Learned",
    excerpt: "Stepping out of the comfort zone. The good, the bad, and the transformative moments.",
    category: "Mission Life",
    author: "Jessica Lee",
    date: "Oct 08, 2025",
    readTime: "6 min",
    views: "900",
    image: img3,
    type: "article"
  },
  {
    id: 4,
    title: "Finding Real Friends in a Lonely City",
    excerpt: "Community doesn't just happen. You have to build it. Here is how we started.",
    category: "Relationships",
    author: "David Chen",
    date: "Oct 05, 2025",
    readTime: "4 min",
    views: "2.1k",
    image: img4,
    type: "podcast"
  }
];

export function BlogGrid() {
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
            {categories.map((cat, i) => (
              <button 
                key={cat}
                className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post (Hero Style) */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-[40px] overflow-hidden aspect-[16/9] md:aspect-[21/9] cursor-pointer"
          >
            <img 
              src={img3} 
              alt="Featured Post" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
                <span className="text-white/80 text-sm font-medium flex items-center gap-1"><Clock className="h-3 w-3" /> 10 min read</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                The Cost of Following Jesus: Is It Worth It?
              </h3>
              <p className="text-white/80 text-lg mb-6 line-clamp-2">
                We talk a lot about the blessings, but what about the sacrifice? A deep dive into the reality of modern discipleship and the joy found in surrender.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white" />
                  <span className="text-white font-bold">Pastor James</span>
                </div>
                <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2">
                  Read Article <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-[30px] p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="relative rounded-[20px] overflow-hidden aspect-[16/10] mb-6">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                  {post.category}
                </div>
                
                {/* Type Indicator */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md h-10 w-10 rounded-full flex items-center justify-center text-white">
                  {post.type === 'video' ? <PlayCircle className="h-5 w-5" /> : 
                   post.type === 'podcast' ? <Mic className="h-5 w-5" /> : 
                   <ArrowRight className="h-5 w-5 -rotate-45" />}
                </div>
              </div>

              <div className="px-2 pb-4">
                <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{post.readTime}</span>
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
                    <span className="text-sm font-bold text-gray-700">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold">
                      <Heart className="h-4 w-4" /> {post.views}
                    </button>
                    <button className="hover:text-blue-500 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="btn-primary">
            Load More Stories
          </button>
        </div>

      </div>
    </section>
  );
}
