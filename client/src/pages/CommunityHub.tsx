import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, MapPin, 
  Video, Image as ImageIcon, Send, Globe,
  Users, Flame, Bell, Search, MoreHorizontal,
  Phone, Video as VideoIcon, Mic, CheckCircle2, Loader2, X, ChevronLeft, ChevronRight,
  Target, Camera, Upload, Plus
} from "lucide-react";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { toast } from "sonner";
import type { Post, User, Comment, UserStory } from "@shared/schema";
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

type UserStoryWithUser = UserStory & { user: User };

type PostWithUser = Post & { user: User; reactionCount?: number; commentCount?: number };
type CommentWithUser = Comment & { user: User };

const staticStories = [
  { id: "sarah", name: "Sarah J.", img: storyImg, hasUnseen: true, route: "/outreach" },
  { id: "mission", name: "Mission Hub", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200", hasUnseen: true, route: "/outreach" },
  { id: "prayer", name: "Prayer Team", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=200", hasUnseen: false, action: "prayer" },
  { id: "revival", name: "Revival Now", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", hasUnseen: true, route: "/group-labs" },
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
  const [viewingStory, setViewingStory] = useState<UserStoryWithUser | null>(null);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);
  const [userStoriesForViewer, setUserStoriesForViewer] = useState<UserStoryWithUser[]>([]);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [storyCaption, setStoryCaption] = useState("");
  const [selectedMediaPreview, setSelectedMediaPreview] = useState<string | null>(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { user, isAuthenticated } = useAuth() as { user: User | null; isAuthenticated: boolean; isLoading: boolean };
  const queryClient = useQueryClient();

  // Fetch user stories from API
  const { data: apiStories = [] } = useQuery<UserStoryWithUser[]>({
    queryKey: ["/api/stories"],
    queryFn: async () => {
      const res = await fetch("/api/stories");
      if (!res.ok) throw new Error("Failed to fetch stories");
      return res.json();
    },
  });

  // Fetch current user's stories
  const { data: myStories = [] } = useQuery<UserStory[]>({
    queryKey: ["/api/stories/me"],
    queryFn: async () => {
      const res = await fetch("/api/stories/me", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Group stories by user
  const storiesByUser = apiStories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, UserStoryWithUser[]>);

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (data: { mediaUrl: string; mediaType: string; caption?: string }) => {
      return apiRequest<UserStory>("POST", "/api/stories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/me"] });
      setShowStoryCreator(false);
      setSelectedMediaPreview(null);
      setSelectedMediaFile(null);
      setStoryCaption("");
      toast.success("Story posted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create story");
    },
  });

  // Handle clicking on a user's story circle
  const handleUserStoryClick = async (userId: string, userStories: UserStoryWithUser[]) => {
    if (userStories.length > 0) {
      setUserStoriesForViewer(userStories);
      setViewingStoryIndex(0);
      setViewingStory(userStories[0]);
      // Record view
      try {
        const { apiFetchJson } = await import('@/lib/apiFetch');
        await apiFetchJson(`/api/stories/${userStories[0].id}/view`, {
          method: "POST",
        });
      } catch (error) {
        // Silently fail
      }
    }
  };

  // Handle clicking "Your Story" to create
  const handleCreateStoryClick = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to create a story");
      setTimeout(() => navigate("/auth"), 1000);
      return;
    }
    setShowStoryCreator(true);
  };

  // Handle static story clicks (links to pages)
  const handleStaticStoryClick = (story: typeof staticStories[0]) => {
    if (story.route) {
      navigate(story.route);
    } else if (story.action === "prayer") {
      setPostFilter("prayer");
      toast.success("Showing prayer requests");
    }
  };

  // Advance to next story in viewer
  const handleStoryAdvance = async () => {
    if (viewingStoryIndex < userStoriesForViewer.length - 1) {
      const nextIndex = viewingStoryIndex + 1;
      setViewingStoryIndex(nextIndex);
      setViewingStory(userStoriesForViewer[nextIndex]);
      // Record view
      try {
        const { apiFetchJson } = await import('@/lib/apiFetch');
        await apiFetchJson(`/api/stories/${userStoriesForViewer[nextIndex].id}/view`, {
          method: "POST",
        });
      } catch (error) {
        // Silently fail
      }
    } else {
      // Close viewer when done
      setViewingStory(null);
      setUserStoriesForViewer([]);
    }
  };

  // Handle file selection for story
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Please select an image or video file");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 50MB");
      return;
    }

    setSelectedMediaFile(file);
    const preview = URL.createObjectURL(file);
    setSelectedMediaPreview(preview);
  };

  // Upload and create story
  const handlePublishStory = async () => {
    if (!selectedMediaFile) {
      toast.error("Please select an image or video");
      return;
    }

    setIsUploadingStory(true);
    try {
      // Get presigned URL
      const { apiFetchJson } = await import('@/lib/apiFetch');
      const { uploadURL, objectPath } = await apiFetchJson("/api/uploads/request-url", {
        method: "POST",
        body: JSON.stringify({
          name: selectedMediaFile.name,
          size: selectedMediaFile.size,
          contentType: selectedMediaFile.type,
        }),
      });

      // Upload file to object storage
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: selectedMediaFile,
        headers: { "Content-Type": selectedMediaFile.type },
      });
      
      if (!uploadRes.ok) throw new Error("Failed to upload file");

      // Create story with the object path
      const mediaType = selectedMediaFile.type.startsWith("video/") ? "video" : "image";
      createStoryMutation.mutate({
        mediaUrl: objectPath,
        mediaType,
        caption: storyCaption || undefined,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload story");
    } finally {
      setIsUploadingStory(false);
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
      return apiRequest<Post>("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewPostContent("");
      toast.success("Post created successfully!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to create a post");
        setTimeout(() => window.location.href = "/login", 1000);
      } else {
        toast.error("Failed to create post");
      }
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (data: { postId: number; emoji: string }) => {
      return apiRequest<{ id: number }>("POST", "/api/reactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to react to posts");
        setTimeout(() => window.location.href = "/login", 1000);
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
      return apiRequest<Comment>("POST", `/api/posts/${data.postId}/comments`, { content: data.content });
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
        setTimeout(() => window.location.href = "/login", 1000);
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
      setTimeout(() => window.location.href = "/login", 1000);
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
      setTimeout(() => window.location.href = "/login", 1000);
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
      setTimeout(() => window.location.href = "/login", 1000);
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

            {/* Instagram-Style Story Viewing Modal */}
            <AnimatePresence>
              {viewingStory && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                  onClick={handleStoryAdvance}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewingStory(null); setUserStoriesForViewer([]); }}
                    className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full z-50"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  
                  {/* User info header */}
                  <div className="absolute top-4 left-4 flex items-center gap-3 z-50">
                    <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white">
                      <img 
                        src={viewingStory.user?.profileImageUrl || userAvatar} 
                        alt={viewingStory.user?.firstName || "User"} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <span className="text-white font-medium block">{viewingStory.user?.firstName || "User"}</span>
                      <span className="text-white/60 text-xs">{formatTimeAgo(viewingStory.createdAt)}</span>
                    </div>
                  </div>

                  {/* Story progress bars */}
                  <div className="absolute top-16 left-4 right-4 flex gap-1 z-50">
                    {userStoriesForViewer.map((_, i) => (
                      <div 
                        key={i}
                        className={`h-0.5 flex-1 rounded-full transition-all ${i < viewingStoryIndex ? 'bg-white' : i === viewingStoryIndex ? 'bg-white' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>

                  {/* Story content - 9:16 aspect ratio */}
                  <motion.div
                    key={viewingStory.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-[400px] w-full mx-4"
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] flex items-center justify-center">
                      {viewingStory.mediaType === "video" ? (
                        <video 
                          src={viewingStory.mediaUrl.startsWith("/objects/") ? viewingStory.mediaUrl : viewingStory.mediaUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          playsInline
                          loop
                        />
                      ) : (
                        <img 
                          src={viewingStory.mediaUrl.startsWith("/objects/") ? viewingStory.mediaUrl : viewingStory.mediaUrl}
                          alt="Story"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {viewingStory.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                          <p className="text-white text-sm">{viewingStory.caption}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Navigation hint */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs flex items-center gap-2">
                    <span>Tap to {viewingStoryIndex < userStoriesForViewer.length - 1 ? "advance" : "close"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Story Creation Modal */}
            <AnimatePresence>
              {showStoryCreator && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 bg-black/50">
                    <button 
                      onClick={() => {
                        setShowStoryCreator(false);
                        setSelectedMediaPreview(null);
                        setSelectedMediaFile(null);
                        setStoryCaption("");
                      }}
                      className="p-2 text-white hover:bg-white/20 rounded-full"
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <h2 className="text-white font-semibold">Create Story</h2>
                    <button
                      onClick={handlePublishStory}
                      disabled={!selectedMediaFile || isUploadingStory}
                      className="px-4 py-2 bg-[#7C9A8E] text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUploadingStory ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Share"
                      )}
                    </button>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 flex items-center justify-center p-4">
                    {selectedMediaPreview ? (
                      <div className="max-w-[400px] w-full aspect-[9/16] relative rounded-2xl overflow-hidden bg-gray-900">
                        {selectedMediaFile?.type.startsWith("video/") ? (
                          <video 
                            src={selectedMediaPreview}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <img 
                            src={selectedMediaPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {/* Caption input overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16">
                          <input
                            type="text"
                            value={storyCaption}
                            onChange={(e) => setStoryCaption(e.target.value)}
                            placeholder="Add a caption..."
                            className="w-full bg-white/20 text-white placeholder-white/60 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                            maxLength={200}
                          />
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={() => {
                            setSelectedMediaPreview(null);
                            setSelectedMediaFile(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="max-w-[400px] w-full aspect-[9/16] bg-gray-900 rounded-2xl flex flex-col items-center justify-center gap-6">
                        <div className="flex gap-4">
                          {/* Camera button */}
                          <button
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
                          >
                            <Camera className="h-8 w-8 text-white" />
                            <span className="text-white text-sm">Camera</span>
                          </button>
                          {/* Upload button */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-white" />
                            <span className="text-white text-sm">Upload</span>
                          </button>
                        </div>
                        <p className="text-white/60 text-sm text-center px-8">
                          Take a photo or upload an image/video for your story
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
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
                    {isAuthenticated ? "Global Watchman" : <button onClick={() => window.location.href = "/login"} className="text-primary hover:underline">Log in</button>}
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
                {/* Your Story - Create button */}
                <button 
                  onClick={handleCreateStoryClick}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group snap-start flex-shrink-0 bg-transparent border-0"
                  data-testid="story-create"
                >
                  <div className="h-14 w-14 md:h-16 md:w-16 rounded-full p-[2px] transition-transform group-hover:scale-105 group-active:scale-95 border-2 border-dashed border-gray-300">
                    <div className="h-full w-full rounded-full overflow-hidden border-2 border-white relative bg-gray-100">
                      <img 
                        src={user?.profileImageUrl || userAvatar} 
                        alt="Your Story" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="bg-[#7C9A8E] rounded-full p-1">
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-gray-600 group-hover:text-[#7C9A8E] max-w-[60px] truncate text-center">
                    {myStories.length > 0 ? "Your Story" : "Add Story"}
                  </span>
                </button>

                {/* User stories from API */}
                {Object.entries(storiesByUser).map(([userId, userStories]) => {
                  const firstStory = userStories[0];
                  if (!firstStory || userId === user?.id) return null;
                  return (
                    <button 
                      key={userId}
                      onClick={() => handleUserStoryClick(userId, userStories)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group snap-start flex-shrink-0 bg-transparent border-0"
                      data-testid={`story-user-${userId}`}
                    >
                      <div className="h-14 w-14 md:h-16 md:w-16 rounded-full p-[2px] transition-transform group-hover:scale-105 group-active:scale-95 bg-gradient-to-tr from-[#7C9A8E] to-[#D4A574]">
                        <div className="h-full w-full rounded-full overflow-hidden border-2 border-white">
                          <img 
                            src={firstStory.user?.profileImageUrl || userAvatar} 
                            alt={firstStory.user?.firstName || "User"} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                      <span className="text-[10px] md:text-xs font-medium text-gray-600 group-hover:text-[#7C9A8E] max-w-[60px] truncate text-center">
                        {firstStory.user?.firstName || "User"}
                      </span>
                    </button>
                  );
                })}

                {/* Static story links */}
                {staticStories.map((story) => (
                  <button 
                    key={story.id} 
                    onClick={() => handleStaticStoryClick(story)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group snap-start flex-shrink-0 bg-transparent border-0"
                    data-testid={`story-${story.id}`}
                  >
                    <div className={`h-14 w-14 md:h-16 md:w-16 rounded-full p-[2px] transition-transform group-hover:scale-105 group-active:scale-95 ${story.hasUnseen ? 'bg-gradient-to-tr from-[#7C9A8E] to-[#D4A574]' : 'border-2 border-gray-200'}`}>
                      <div className="h-full w-full rounded-full overflow-hidden border-2 border-white">
                        <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
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
                    onClick={() => window.location.href = "/login"}
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
                                  onClick={() => window.location.href = "/login"}
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
