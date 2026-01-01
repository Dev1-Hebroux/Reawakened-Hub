import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./Admin";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X, Loader2, AlertTriangle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PrayerRequest, Testimony } from "@shared/schema";

export function AdminModeration() {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: postsLoading } = useQuery<any[]>({
    queryKey: ["/api/posts"],
  });

  const { data: prayerRequests = [], isLoading: prayerLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayer-requests"],
  });

  const { data: testimonies = [], isLoading: testimoniesLoading } = useQuery<Testimony[]>({
    queryKey: ["/api/testimonies"],
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout 
      title="Moderation Queue" 
      subtitle="Review and manage community content"
    >
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="prayers" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Prayer Requests ({prayerRequests.length})
          </TabsTrigger>
          <TabsTrigger value="testimonies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Testimonies ({testimonies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {postsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No posts to review</h3>
              <p className="text-gray-500">All community posts will appear here for moderation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start gap-4">
                    {post.user?.profileImageUrl ? (
                      <img src={post.user.profileImageUrl} alt="" className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">
                          {post.user?.firstName} {post.user?.lastName}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                          {post.type}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{post.content}</p>
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt="" className="mt-3 rounded-lg max-h-48 object-cover" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="prayers">
          {prayerLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : prayerRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No prayer requests</h3>
              <p className="text-gray-500">Prayer requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prayerRequests.map((request, i) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{request.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(request.createdAt)}</span>
                    {request.isPrivate === "true" && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Private</span>
                    )}
                  </div>
                  <p className="text-gray-700">{request.request}</p>
                  {request.email && (
                    <p className="text-sm text-gray-500 mt-2">Email: {request.email}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="testimonies">
          {testimoniesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : testimonies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No testimonies to review</h3>
              <p className="text-gray-500">Testimonies pending approval will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonies.map((testimony, i) => (
                <motion.div
                  key={testimony.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{testimony.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(testimony.createdAt)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      testimony.isApproved === "true" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {testimony.isApproved === "true" ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-gray-700">{testimony.testimony}</p>
                  {testimony.email && (
                    <p className="text-sm text-gray-500 mt-2">Email: {testimony.email}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

export default AdminModeration;
