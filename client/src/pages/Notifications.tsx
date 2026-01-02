import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Trash2, ArrowLeft, Heart, MessageCircle, Calendar, Flame, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: number;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: string | null;
  read: boolean;
  createdAt: string;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'post_like':
    case 'spark_reaction':
      return Heart;
    case 'post_comment':
    case 'comment_reply':
      return MessageCircle;
    case 'event_reminder':
      return Calendar;
    case 'new_spark':
    case 'spark_published':
      return Flame;
    case 'new_follower':
      return Users;
    default:
      return Bell;
  }
};

export default function Notifications() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.data) {
      try {
        const data = JSON.parse(notification.data);
        if (data.link) navigate(data.link);
      } catch (e) {}
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a2744]">
        <Navbar />
        <main className="pt-28 pb-32 px-4">
          <div className="max-w-lg mx-auto text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to view notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Stay updated on your community activity</p>
            <Button onClick={() => window.location.href = "/api/login"} className="bg-primary text-white">
              Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a2744]">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button 
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white mb-4"
              data-testid="button-back-profile"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Profile</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={markAllReadMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-mark-all-read"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-[#243656] rounded-2xl p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No notifications yet</h2>
              <p className="text-gray-500 dark:text-gray-400">
                We'll notify you when there's activity in your community
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {notifications.map((notification, i) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      notification.read 
                        ? 'bg-white dark:bg-[#243656] border-gray-100 dark:border-[#4A7C7C]/20' 
                        : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
                    } hover:shadow-md`}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.read 
                          ? 'bg-gray-100 dark:bg-[#1a2744]' 
                          : 'bg-primary/10'
                      }`}>
                        <Icon className={`h-5 w-5 ${notification.read ? 'text-gray-400' : 'text-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-bold text-sm ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {notification.body}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
