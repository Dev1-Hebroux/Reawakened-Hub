import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Share2, Heart, BookOpen, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { BlogPost } from "@shared/schema";

import defaultImg from "@assets/generated_images/open_bible_on_a_cafe_table_with_coffee.png";

function formatDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/${params.slug}`],
    enabled: !!params.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-500 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <button className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2" data-testid="button-back-to-blog">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="pt-20">
        <article>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
          >
            <img 
              src={post.coverImageUrl || defaultImg} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-4xl mx-auto">
              <Link href="/blog">
                <button className="text-white/80 hover:text-white mb-6 flex items-center gap-2 font-medium transition-colors" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4" /> Back to Blog
                </button>
              </Link>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-4" data-testid="text-post-title">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-6 text-white/70 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  5 min read
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-lg">
                R
              </div>
              <div>
                <p className="font-bold text-gray-900">Reawakened Team</p>
                <p className="text-sm text-gray-500">{post.category}</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" data-testid="button-like-post">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" data-testid="button-share-post">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium italic border-l-4 border-primary pl-6">
                {post.excerpt}
              </p>
            )}

            <div 
              className="prose prose-lg prose-gray max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-blockquote:border-primary prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              data-testid="text-post-content"
            />

            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="bg-gradient-to-br from-primary/5 to-orange-50 rounded-3xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Was this helpful?</h3>
                <p className="text-gray-600 mb-6">Share this post with someone who needs to hear it today.</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post.title + " - " + window.location.href)}`, "_blank")}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2"
                    data-testid="button-share-whatsapp"
                  >
                    Share on WhatsApp
                  </button>
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, "_blank")}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2"
                    data-testid="button-share-twitter"
                  >
                    Share on X
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/blog">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 mx-auto" data-testid="button-more-posts">
                  <ArrowLeft className="h-4 w-4" /> More Stories
                </button>
              </Link>
            </div>
          </motion.div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}

function formatContent(content: string): string {
  let html = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');
  
  return `<p>${html}</p>`;
}
