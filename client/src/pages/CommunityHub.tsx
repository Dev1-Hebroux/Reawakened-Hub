import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, MapPin, 
  Video, Image as ImageIcon, Send, Globe,
  Users, Flame, Bell, Search, MoreHorizontal,
  Phone, Video as VideoIcon, Mic, CheckCircle2, Loader2, X, ChevronLeft, ChevronRight,
  Target
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import type { Post, User, Comment } from "@shared/schema";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GrowthToolsDiscovery } from "@/components/GrowthToolsDiscovery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import mapBg from "@assets/generated_images/digital_map_of_the_world_with_glowing_connections.png";
import userAvatar from "@assets/generated_images/diverse_group_taking_a_selfie.png"; 
import feedImg from "@assets/generated_images/hands_typing_on_a_phone_with_bible_in_background.png";
import storyImg from "@assets/generated_images/young_woman_speaking_passionately_into_camera.png";

type PostWithUser = Post & { user: User; reactionCount?: number; commentCount?: number };
type CommentWithUser = Comment & { user: User };

const stories = [
  { id: 1, name: "Your Story", img: userAvatar, isUser: true, route: null, action: "create" },
  { id: 2, name: "Sarah J.", img: storyImg, hasUnseen: true, route: "/outreach" },
  { id: 3, name: "Mission Hub", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200", hasUnseen: true, route: "/outreach" },
  { id: 4, name: "Prayer Team", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=200", hasUnseen: false, action: "prayer" },
  { id: 5, name: "Revival Now", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", hasUnseen: true, route: "/group-labs" },
];

const groups = [
  { id: 1, name: "Europe Intercessors", members: "1.2k", active: true },
  { id: 2, name: "Gen Z Evangelists", members: "4.5k", active: true },
  { id: 3, name: "Creative Missionaries", members: "850", active: false },
];

export function CommunityHub() {
  const [, navigate] = useLocation();
  const [postFilter, setPostFilter] = useState<"all" | "mission" | "prayer">("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<"mission" | "prayer">("mission");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [viewingStory, setViewingStory] = useState<typeof stories[0] | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  
  const { user, isAuthenticated } = useAuth() as { user: User | null; isAuthenticated: boolean; isLoading: boolean };
  const queryClient = useQueryClient();

  const handleStoryClick = (story: typeof stories[0]) => {
    if (story.route) {
      navigate(story.route);
    } else if (story.action === "create") {
      toast.info("Story creation coming soon!");
    } else if (story.action === "view") {
      setViewingStory(story);
      setStoryIndex(stories.findIndex(s => s.id === story.id));
    } else if (story.action === "prayer") {
      setPostFilter("prayer");
      toast.success("Showing prayer requests");
    }
  };

  const handleStoryAdvance = () => {
    if (storyIndex < stories.length - 1) {
      const nextStory = stories[storyIndex + 1];
      if (nextStory.route) {
        setViewingStory(null);
        setTimeout(() => navigate(nextStory.route!), 100);
      } else {
        setStoryIndex(storyIndex + 1);
        setViewingStory(nextStory);
      }
    } else {
      setViewingStory(null);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition error");
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewPostContent(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.start();
    } catch (error) {
      toast.error("Voice input not available");
    }
  };

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
  });

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (postFilter === "all") return true;
    return post.type === postFilter;
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; type: string }) => {
      const res = await apiRequest("POST", "/api/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      toast.success("Post created successfully!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to create a post");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to create post");
      }
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (data: { postId: number; emoji: string }) => {
      const res = await apiRequest("POST", "/api/reactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to react to posts");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to add reaction");
      }
    },
  });

  // Fetch comments for expanded posts
  const { data: commentsData = {}, isLoading: isLoadingComments } = useQuery<Record<number, CommentWithUser[]>>({
    queryKey: ["/api/posts/comments", ...expandedComments],
    queryFn: async () => {
      if (expandedComments.length === 0) return {};
      const results: Record<number, CommentWithUser[]> = {};
      await Promise.all(
        expandedComments.map(async (postId) => {
          const res = await fetch(`/api/posts/${postId}/comments`);
          if (res.ok) {
            results[postId] = await res.json();
          }
        })
      );
      return results;
    },
    enabled: expandedComments.length > 0,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: { postId: number; content: string }) => {
      const res = await apiRequest("POST", `/api/posts/${data.postId}/comments`, { content: data.content });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts/comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCommentInputs(prev => ({ ...prev, [variables.postId]: "" }));
      toast.success("Comment posted!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to comment");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to post comment");
      }
    },
  });

  const toggleComments = (postId: number) => {
    setExpandedComments(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      } else {
        return [...prev, postId];
      }
    });
  };

  const handleSubmitComment = (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) {
      toast.error("Please enter a comment");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to comment");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    createCommentMutation.mutate({ postId, content });
  };

  const handleCreatePost = () => {
    if (isSubmittingPost || createPostMutation.isPending) {
      return;
    }
    if (!newPostContent.trim()) {
      toast.error("Please enter some content");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to create a post");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    setIsSubmittingPost(true);
    createPostMutation.mutate(
      { content: newPostContent, type: newPostType },
      {
        onSettled: () => {
          setIsSubmittingPost(false);
        },
      }
    );
  };

  const handleReaction = (postId: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to react to posts");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }
    addReactionMutation.mutate({ postId, emoji: "❤️" });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hrs ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

            {/* Story Viewing Modal */}
            <AnimatePresence>
              {viewingStory && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                  onClick={handleStoryAdvance}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewingStory(null); }}
                    className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full z-50"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  
                  <div className="absolute top-4 left-4 flex items-center gap-3 z-50">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white">
                      <img src={viewingStory.img} alt={viewingStory.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white font-medium">{viewingStory.name}</span>
                  </div>

                  <div className="absolute top-16 left-4 right-4 flex gap-1 z-50">
                    {stories.filter(s => !s.isUser).map((_, i) => (
                      <div 
                        key={i}
                        className={`h-0.5 flex-1 rounded-full ${i <= storyIndex - 1 ? 'bg-white' : i === storyIndex - 1 ? 'bg-white' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>

                  <motion.div
                    key={viewingStory.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full mx-4"
                  >
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#7C9A8E] to-[#4A7C7C] aspect-[9/16] flex items-center justify-center">
                      <img 
                        src={viewingStory.img} 
                        alt={viewingStory.name} 
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                      <div className="relative z-10 text-center p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">{viewingStory.name}'s Story</h3>
                        <p className="text-white/80 text-sm">Tap to continue to post details</p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs flex items-center gap-2">
                    <span>Tap to advance</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          
          {/* Left Sidebar - Navigation & Profile (20%) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary p-0.5">
                  <img 
                    src={user?.profileImageUrl || userAvatar} 
                    alt={user?.firstName || "User"} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {isAuthenticated ? `Welcome, ${user?.firstName}!` : "Welcome!"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isAuthenticated ? "Global Watchman" : <button onClick={() => window.location.href = "/api/login"} className="text-primary hover:underline">Log in</button>}
                  </p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {[
                  { icon: Globe, label: "Global Feed", active: true },
                  { icon: Users, label: "My Squads", active: false },
                  { icon: MessageCircle, label: "Messages", active: false, badge: "3" },
                  { icon: MapPin, label: "Mission Map", active: false },
                  { icon: Flame, label: "Prayer Alerts", active: false, badge: "12" },
                ].map((item) => (
                  <button 
                    key={item.label}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${item.active ? 'bg-orange-50 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-gradient-to-br from-primary to-orange-600 rounded-[30px] p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">Daily Mission</h3>
                <p className="text-white/80 text-sm mb-4">Pray for 3 friends today and share a scripture with them.</p>
                <button className="bg-white text-primary px-4 py-2 rounded-full text-sm font-bold w-full">Mark Complete</button>
              </div>
              <Flame className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10" />
            </div>

            <GrowthToolsDiscovery variant="compact" title="Grow Your Faith" />
          </div>

          {/* Center - Main Feed (55%) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Stories / Status Bar */}
            <div className="bg-white rounded-2xl md:rounded-[30px] p-3 md:p-6 shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              <div className="flex gap-3 md:gap-4">
                {stories.map((story) => (
                  <button 
                    key={story.id} 
                    onClick={() => handleStoryClick(story)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group snap-start flex-shrink-0 bg-transparent border-0"
                    data-testid={`story-${story.id}`}
                  >
                    <div className={`h-14 w-14 md:h-16 md:w-16 rounded-full p-[2px] transition-transform group-hover:scale-105 group-active:scale-95 ${story.isUser ? 'border-2 border-dashed border-gray-300' : story.hasUnseen ? 'bg-gradient-to-tr from-[#7C9A8E] to-[#D4A574]' : 'border-2 border-gray-200'}`}>
                      <div className="h-full w-full rounded-full overflow-hidden border-2 border-white relative">
                        <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
                        {story.isUser && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="bg-white rounded-full p-1">
                              <MoreHorizontal className="h-3 w-3 text-[#7C9A8E]" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] md:text-xs font-medium text-gray-600 group-hover:text-[#7C9A8E] max-w-[60px] truncate text-center">{story.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-full p-1.5 shadow-sm border border-gray-100 flex gap-1">
              <button
                data-testid="filter-all"
                onClick={() => setPostFilter("all")}
                className={`flex-1 py-2 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  postFilter === "all" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                All Posts
              </button>
              <button
                data-testid="filter-mission"
                onClick={() => setPostFilter("mission")}
                className={`flex-1 py-2 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  postFilter === "mission" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Missions
              </button>
              <button
                data-testid="filter-prayer"
                onClick={() => setPostFilter("prayer")}
                className={`flex-1 py-2 px-3 md:px-4 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  postFilter === "prayer" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Prayers
              </button>
            </div>

            {/* Create Post */}
            <div className="bg-white rounded-2xl md:rounded-[30px] p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex gap-3 mb-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img 
                    src={user?.profileImageUrl || userAvatar} 
                    alt={user?.firstName || "User"} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    data-testid="input-create-post"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share a testimony, prayer request, or mission update..." 
                    className="w-full bg-gray-50 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A8E]/30 resize-none min-h-[100px]"
                    rows={4}
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-[#7C9A8E]/10 hover:text-[#7C9A8E]'}`}
                    data-testid="button-voice-input"
                    title="Voice to text"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center border-t border-gray-100 pt-4">
                <Select value={newPostType} onValueChange={(value) => setNewPostType(value as "mission" | "prayer")}>
                  <SelectTrigger className="w-full sm:w-[140px] border-gray-200 rounded-xl" data-testid="select-post-type">
                    <SelectValue placeholder="Post type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                    <SelectItem value="mission" className="cursor-pointer">Mission</SelectItem>
                    <SelectItem value="prayer" className="cursor-pointer">Prayer</SelectItem>
                  </SelectContent>
                </Select>
                <button 
                  data-testid="button-submit-post"
                  onClick={handleCreatePost}
                  disabled={isSubmittingPost || createPostMutation.isPending || !newPostContent.trim()}
                  className="bg-[#7C9A8E] text-white px-6 py-3 rounded-full hover:bg-[#6B8B7E] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium w-full sm:w-auto"
                >
                  {isSubmittingPost || createPostMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Feed Posts */}
            {isLoading ? (
              <div className="bg-white rounded-2xl md:rounded-[30px] p-8 md:p-12 shadow-sm border border-gray-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl md:rounded-[30px] p-8 md:p-12 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500 mb-4">No posts yet. Be the first to share!</p>
                {!isAuthenticated && (
                  <button
                    onClick={() => window.location.href = "/api/login"}
                    className="text-primary font-medium hover:underline"
                  >
                    Log in to create a post
                  </button>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <motion.div 
                  key={post.id}
                  data-testid={`post-${post.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl md:rounded-[30px] overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          <img 
                            src={post.user?.profileImageUrl || userAvatar} 
                            alt={post.user?.firstName || "User"} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm" data-testid={`text-author-${post.id}`}>
                            {post.user?.firstName} {post.user?.lastName}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span data-testid={`text-time-${post.id}`}>
                              {formatTimeAgo(post.createdAt!)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 capitalize" data-testid={`text-type-${post.id}`}>
                              {post.type === 'mission' ? <MapPin className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
                              {post.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-gray-800 mb-4 leading-relaxed" data-testid={`text-content-${post.id}`}>
                      {post.content}
                    </p>
                    
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden mb-4 relative aspect-video">
                        <img src={post.imageUrl} alt="Content" className="w-full h-full object-cover" />
                        {post.type === 'prayer' && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                            <Flame className="h-3 w-3" /> PRAYER REQUEST
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <button 
                        data-testid={`button-react-${post.id}`}
                        onClick={() => handleReaction(post.id)}
                        disabled={addReactionMutation.isPending}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <Heart className="h-5 w-5" />
                        <span className="text-sm font-medium" data-testid={`text-reactions-${post.id}`}>
                          {post.reactionCount || 0}
                        </span>
                      </button>
                      <button 
                        data-testid={`button-comment-${post.id}`}
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-2 transition-colors ${expandedComments.includes(post.id) ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium" data-testid={`text-comments-${post.id}`}>
                          {post.commentCount || 0}
                        </span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="h-5 w-5" />
                        <span className="text-sm font-medium">0</span>
                      </button>
                    </div>

                    {/* Collapsible Comment Section */}
                    <AnimatePresence>
                      {expandedComments.includes(post.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                          data-testid={`comments-section-${post.id}`}
                        >
                          <div className="pt-4 border-t border-gray-100 mt-4">
                            {/* Comments List */}
                            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                              {isLoadingComments && !commentsData[post.id] ? (
                                <div className="flex items-center justify-center py-4" data-testid={`comments-loading-${post.id}`}>
                                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                </div>
                              ) : commentsData[post.id]?.length === 0 || !commentsData[post.id] ? (
                                <p className="text-gray-500 text-sm text-center py-4" data-testid={`comments-empty-${post.id}`}>
                                  No comments yet. Be the first to comment!
                                </p>
                              ) : (
                                commentsData[post.id]?.map((comment) => (
                                  <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                      <img 
                                        src={comment.user?.profileImageUrl || userAvatar} 
                                        alt={comment.user?.firstName || "User"} 
                                        className="w-full h-full object-cover"
                                        data-testid={`comment-avatar-${comment.id}`}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="bg-gray-50 rounded-2xl px-4 py-2">
                                        <h5 className="font-semibold text-sm text-gray-900" data-testid={`comment-author-${comment.id}`}>
                                          {comment.user?.firstName} {comment.user?.lastName}
                                        </h5>
                                        <p className="text-sm text-gray-700" data-testid={`comment-content-${comment.id}`}>
                                          {comment.content}
                                        </p>
                                      </div>
                                      <span className="text-xs text-gray-500 ml-4" data-testid={`comment-time-${comment.id}`}>
                                        {formatTimeAgo(comment.createdAt!)}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Comment Input */}
                            {isAuthenticated ? (
                              <div className="flex gap-3" data-testid={`comment-input-section-${post.id}`}>
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img 
                                    src={user?.profileImageUrl || userAvatar} 
                                    alt={user?.firstName || "User"} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    data-testid={`input-comment-${post.id}`}
                                    value={commentInputs[post.id] || ""}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmitComment(post.id)}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A8E]/30"
                                  />
                                  <button
                                    data-testid={`button-submit-comment-${post.id}`}
                                    onClick={() => handleSubmitComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim() || createCommentMutation.isPending}
                                    className="bg-[#7C9A8E] text-white p-2 rounded-full hover:bg-[#6B8B7E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {createCommentMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2" data-testid={`comment-login-prompt-${post.id}`}>
                                <button
                                  onClick={() => window.location.href = "/api/login"}
                                  className="text-primary font-medium text-sm hover:underline"
                                >
                                  Log in to comment
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Right Sidebar - Chat & Trending (25%) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Active Squads */}
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Your Squads</h3>
                <button className="text-primary text-xs font-bold">See All</button>
              </div>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary font-bold">
                        {group.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{group.name}</h4>
                        <p className="text-xs text-gray-500">{group.members} active</p>
                      </div>
                    </div>
                    {group.active && <div className="h-2 w-2 rounded-full bg-green-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Vision & Goals Card */}
            <div 
              onClick={() => navigate("/vision")}
              className="bg-gradient-to-br from-[#7C9A8E] to-[#4A7C7C] rounded-[30px] p-6 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
              data-testid="card-vision-goals"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5" />
                  <span className="text-xs font-medium text-white/80">Growth Tool</span>
                </div>
                <h3 className="font-bold text-xl mb-2">Vision & Goals</h3>
                <p className="text-white/80 text-sm mb-4">Discover your purpose, set meaningful goals, and track your progress.</p>
                <button className="bg-white text-[#4A7C7C] px-4 py-2 rounded-full text-sm font-bold w-full group-hover:bg-white/90 transition-colors">
                  Start Your Journey
                </button>
              </div>
              <Target className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10" />
            </div>

            {/* Quick Chat */}
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Team Chat</h3>
                <div className="flex gap-2">
                  <VideoIcon className="h-4 w-4 text-gray-400 hover:text-primary cursor-pointer" />
                  <Phone className="h-4 w-4 text-gray-400 hover:text-primary cursor-pointer" />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 text-xs text-gray-700">
                    Has everyone seen the update from Kenya?
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0" />
                  <div className="bg-primary/10 rounded-2xl rounded-tr-none p-3 text-xs text-gray-900">
                    Yes! Incredible testimony. Sharing it now.
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 text-xs text-gray-700">
                    Let's pray for them at 3pm.
                  </div>
                </div>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="w-full bg-gray-50 rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                  <Mic className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
