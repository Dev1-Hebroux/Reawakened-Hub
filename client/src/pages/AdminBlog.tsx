import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./Admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Edit2, Trash2, Loader2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BlogPost } from "@shared/schema";

export function AdminBlog() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
  });

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest<any>("POST", "/api/admin/blog", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("Blog post created successfully!");
      closeModal();
    },
    onError: () => toast.error("Failed to create blog post"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return await apiRequest<any>("PUT", `/api/admin/blog/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast.success("Blog post updated successfully!");
      closeModal();
    },
    onError: () => toast.error("Failed to update blog post"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast.success("Blog post deleted successfully!");
    },
    onError: () => toast.error("Failed to delete blog post"),
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImageUrl: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error("Please fill in required fields");
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: { ...formData, slug } });
    } else {
      createMutation.mutate({ ...formData, slug });
    }
  };

  const handleDelete = (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      deleteMutation.mutate(post.id);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AdminLayout 
      title="Blog Manager" 
      subtitle="Create and manage blog posts"
      actions={
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-500 mb-6">Start writing to share your message with the world.</p>
          <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Write First Post
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
            >
              {post.coverImageUrl ? (
                <img 
                  src={post.coverImageUrl} 
                  alt="" 
                  className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate mb-1">{post.title}</h3>
                <p className="text-sm text-gray-500 truncate">{post.excerpt}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(post.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEditModal(post)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(post)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create Post"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
                placeholder="Post title"
                data-testid="input-blog-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="post-url-slug"
                data-testid="input-blog-slug"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Excerpt *</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary shown in listings"
                rows={2}
                data-testid="input-blog-excerpt"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full blog post content..."
                rows={10}
                data-testid="input-blog-content"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cover Image URL</label>
              <Input
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://..."
                data-testid="input-blog-image"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-blog"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingPost ? "Update Post" : "Publish Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminBlog;
