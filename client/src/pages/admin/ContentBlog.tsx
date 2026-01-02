import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  BookOpen, Search, Plus, MoreVertical, 
  Loader2, Calendar, Edit, Trash2, Eye, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { BlogPost } from "@shared/schema";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: string;
}

const defaultFormData: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  category: '',
};

export function ContentBlog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BlogPost | null>(null);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(defaultFormData);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog-posts"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/blog-posts`);
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const res = await fetch('/api/admin/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create blog post');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Post created", description: "The blog post has been created successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BlogFormData> }) => {
      const res = await fetch(`/api/admin/blog-posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update blog post');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Post updated", description: "The blog post has been updated successfully." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/blog-posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete blog post');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Post deleted", description: "The blog post has been deleted." });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return post.title.toLowerCase().includes(query) || 
             post.excerpt?.toLowerCase().includes(query);
    }
    return true;
  });

  const openModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImageUrl: post.coverImageUrl || '',
        category: post.category || '',
      });
    } else {
      setEditingPost(null);
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = () => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout 
      title="Blog Posts" 
      subtitle={`${posts.length} total posts`}
      breadcrumbs={[{ label: "Content" }, { label: "Blog Posts" }]}
      actions={
        <Button 
          onClick={() => openModal()}
          className="bg-[#1a2744] hover:bg-[#1a2744]/90"
          data-testid="button-create-post"
        >
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
      }
    >
      <Card className="border-0 shadow-sm mb-6" data-testid="card-blog-filters">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-posts"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a2744]" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="border-0 shadow-sm" data-testid="card-no-posts">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No blog posts found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search." 
                : "Create your first blog post to get started."}
            </p>
            <Button onClick={() => openModal()} data-testid="button-create-first-post">
              <Plus className="h-4 w-4 mr-2" /> Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden" data-testid="card-posts-table">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-posts">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden md:table-cell">Author</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 hidden lg:table-cell">Published Date</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPosts.map((post, i) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50"
                    data-testid={`row-post-${post.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.coverImageUrl ? (
                          <img 
                            src={post.coverImageUrl} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0" 
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-purple-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate" data-testid={`text-post-title-${post.id}`}>
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        <span data-testid={`text-post-author-${post.id}`}>Author</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge 
                        variant="outline"
                        className={post.publishedAt ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}
                        data-testid={`badge-post-status-${post.id}`}
                      >
                        {post.publishedAt ? 'published' : 'draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span data-testid={`text-post-date-${post.id}`}>{formatDate(post.publishedAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            data-testid={`button-post-actions-${post.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewPost(post)} data-testid={`button-preview-post-${post.id}`}>
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openModal(post)} data-testid={`button-edit-post-${post.id}`}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteConfirm(post)}
                            className="text-red-600"
                            data-testid={`button-delete-post-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-post-form">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            <DialogDescription>
              {editingPost ? 'Update the blog post details below.' : 'Fill in the details to create a new blog post.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    title,
                    slug: prev.slug || generateSlug(title)
                  }));
                }}
                placeholder="Enter post title"
                data-testid="input-post-title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="post-url-slug"
                data-testid="input-post-slug"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief summary of the post..."
                rows={2}
                data-testid="input-post-excerpt"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post content here..."
                rows={10}
                className="font-mono text-sm"
                data-testid="input-post-content"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <Input
                  id="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                  placeholder="https://..."
                  data-testid="input-post-image"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Faith, Lifestyle"
                  data-testid="input-post-category"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} data-testid="button-cancel-post">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.title || !formData.slug || !formData.content || !formData.excerpt || !formData.category || isPending}
              className="bg-[#1a2744] hover:bg-[#1a2744]/90"
              data-testid="button-save-post"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewPost} onOpenChange={() => setPreviewPost(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-post-preview">
          <DialogHeader>
            <DialogTitle>Preview: {previewPost?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {previewPost?.coverImageUrl && (
              <img 
                src={previewPost.coverImageUrl} 
                alt={previewPost.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {previewPost?.category && (
                <Badge variant="outline">{previewPost.category}</Badge>
              )}
              <span>{formatDate(previewPost?.publishedAt)}</span>
            </div>
            
            {previewPost?.excerpt && (
              <p className="text-lg text-gray-600 mb-4 italic">{previewPost.excerpt}</p>
            )}
            
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{previewPost?.content}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent data-testid="dialog-delete-post">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

export default ContentBlog;