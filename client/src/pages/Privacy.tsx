import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Shield, ArrowLeft, Eye, Mail, MapPin, MessageCircle, 
  Users, Lock, Globe, UserX
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserSettings = {
  id: number;
  userId: string;
  theme: string;
  language: string;
  profileVisibility: string;
  showEmail: boolean;
  showLocation: boolean;
  allowMessaging: boolean;
};

export default function Privacy() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  const [allowMessaging, setAllowMessaging] = useState(true);

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (settings) {
      setProfileVisibility(settings.profileVisibility || "public");
      setShowEmail(settings.showEmail);
      setShowLocation(settings.showLocation);
      setAllowMessaging(settings.allowMessaging);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      await apiRequest("PUT", "/api/user/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast.success("Privacy settings saved");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const handleVisibilityChange = (value: string) => {
    setProfileVisibility(value);
    updateSettingsMutation.mutate({ profileVisibility: value });
  };

  const handleToggle = (key: string, value: boolean) => {
    switch (key) {
      case "showEmail": setShowEmail(value); break;
      case "showLocation": setShowLocation(value); break;
      case "allowMessaging": setAllowMessaging(value); break;
    }
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a2744]">
        <Navbar />
        <main className="pt-28 pb-32 px-4">
          <div className="max-w-lg mx-auto text-center">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to access privacy settings</h1>
            <Button onClick={() => window.location.href = "/login"} className="bg-primary text-white">
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

            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Privacy & Security
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Control who can see your information
            </p>
          </motion.div>

          {/* Profile Visibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 mb-4 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#7C9A8E]" />
              Profile Visibility
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Who can see your profile</Label>
                <Select value={profileVisibility} onValueChange={handleVisibilityChange}>
                  <SelectTrigger className="w-full" data-testid="select-visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Public - Anyone can view</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="community">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Community - Only members</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Private - Only you</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-gray-200 dark:border-[#4A7C7C]/20 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Email</Label>
                      <p className="text-xs text-gray-500">Display email on your profile</p>
                    </div>
                  </div>
                  <Switch 
                    checked={showEmail} 
                    onCheckedChange={(v) => handleToggle("showEmail", v)}
                    data-testid="switch-show-email"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Location</Label>
                      <p className="text-xs text-gray-500">Display region on your profile</p>
                    </div>
                  </div>
                  <Switch 
                    checked={showLocation} 
                    onCheckedChange={(v) => handleToggle("showLocation", v)}
                    data-testid="switch-show-location"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Messaging</Label>
                      <p className="text-xs text-gray-500">Let others send you messages</p>
                    </div>
                  </div>
                  <Switch 
                    checked={allowMessaging} 
                    onCheckedChange={(v) => handleToggle("allowMessaging", v)}
                    data-testid="switch-allow-messaging"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 mb-4 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#7C9A8E]" />
              Account Security
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1a2744] rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Connected Account</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Signed in with email
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1a2744] rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email || "No email connected"}
                  </p>
                </div>
                <Mail className="h-5 w-5 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1a2744] rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Member Since</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </motion.div>

          {/* Data & Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserX className="h-5 w-5 text-[#7C9A8E]" />
              Data & Account
            </h2>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-left"
                data-testid="button-download-data"
              >
                Download my data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                data-testid="button-delete-account"
              >
                Delete account
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Deleting your account will permanently remove all your data. This action cannot be undone.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
