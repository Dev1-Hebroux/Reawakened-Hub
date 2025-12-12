import { motion } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, MapPin, 
  Video, Image as ImageIcon, Send, Globe,
  Users, Flame, Bell, Search, MoreHorizontal,
  Phone, Video as VideoIcon, Mic, CheckCircle2
} from "lucide-react";
import { useState } from "react";
import mapBg from "@assets/generated_images/digital_map_of_the_world_with_glowing_connections.png";
import userAvatar from "@assets/generated_images/diverse_group_taking_a_selfie.png"; 
import feedImg from "@assets/generated_images/hands_typing_on_a_phone_with_bible_in_background.png";
import storyImg from "@assets/generated_images/young_woman_speaking_passionately_into_camera.png";

const stories = [
  { id: 1, name: "Your Story", img: userAvatar, isUser: true },
  { id: 2, name: "Sarah J.", img: storyImg, hasUnseen: true },
  { id: 3, name: "Mission UK", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200", hasUnseen: true },
  { id: 4, name: "Prayer Team", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=200", hasUnseen: false },
  { id: 5, name: "Revival Now", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200", hasUnseen: true },
];

const posts = [
  {
    id: 1,
    author: "Global Watchmen London",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
    time: "2 hrs ago",
    location: "London, UK",
    content: "URGENT: Join us in prayer for the youth gathering in Brixton tonight. We are believing for a massive outpouring of the Spirit! 🔥🇬🇧 #Revival #London",
    image: mapBg,
    likes: 245,
    comments: 42,
    shares: 12,
    type: "alert"
  },
  {
    id: 2,
    author: "Jessica Chen",
    avatar: storyImg,
    time: "4 hrs ago",
    location: "Taipei, Taiwan",
    content: "Just finished our campus outreach. 5 students gave their lives to Jesus today! The hunger is real. Here is a clip from our worship time.",
    image: feedImg,
    likes: 892,
    comments: 156,
    shares: 89,
    type: "update"
  }
];

const groups = [
  { id: 1, name: "Europe Intercessors", members: "1.2k", active: true },
  { id: 2, name: "Gen Z Evangelists", members: "4.5k", active: true },
  { id: 3, name: "Creative Missionaries", members: "850", active: false },
];

export function CommunityHub() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Navigation & Profile (20%) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary p-0.5">
                  <img src={userAvatar} alt="User" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Welcome back!</h3>
                  <p className="text-xs text-gray-500">Global Watchman</p>
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
          </div>

          {/* Center - Main Feed (55%) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Stories / Status Bar */}
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-max">
                {stories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className={`h-16 w-16 rounded-full p-[3px] ${story.isUser ? 'border-2 border-dashed border-gray-300' : story.hasUnseen ? 'bg-gradient-to-tr from-primary to-yellow-500' : 'border-2 border-gray-200'}`}>
                      <div className="h-full w-full rounded-full overflow-hidden border-2 border-white relative">
                        <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
                        {story.isUser && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="bg-white rounded-full p-1">
                              <MoreHorizontal className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary">{story.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Post */}
            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
              <div className="flex gap-4 mb-4">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                </div>
                <input 
                  type="text" 
                  placeholder="Share a testimony, prayer request, or mission update..." 
                  className="flex-1 bg-gray-50 rounded-full px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-primary text-sm font-medium">
                    <Video className="h-5 w-5 text-red-500" /> Live
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-primary text-sm font-medium">
                    <ImageIcon className="h-5 w-5 text-green-500" /> Photo/Video
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-primary text-sm font-medium">
                    <MapPin className="h-5 w-5 text-blue-500" /> Check-in
                  </button>
                </div>
                <button className="bg-primary text-white p-2 rounded-full hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Feed Posts */}
            {posts.map((post) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{post.author}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{post.time}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {post.location}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
                  
                  {post.image && (
                    <div className="rounded-2xl overflow-hidden mb-4 relative aspect-video">
                      <img src={post.image} alt="Content" className="w-full h-full object-cover" />
                      {post.type === 'alert' && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                          <Flame className="h-3 w-3" /> PRAYER ALERT
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm font-medium">{post.shares}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
    </div>
  );
}
