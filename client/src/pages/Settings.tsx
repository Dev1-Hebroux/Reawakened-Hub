import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings as SettingsIcon, ArrowLeft, Moon, Sun, Monitor, Globe, 
  Bell, Mail, Heart, MessageCircle, Calendar, Flame, Smartphone, 
  BellRing, Users, Loader2, Download, CheckCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNotifications } from "@/services/NotificationService";
import { usePWA } from "@/components/PWAComponents";
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

type NotificationPreferences = {
  id: number;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  prayerSessionAlerts: boolean;
  newSparkAlerts: boolean;
  eventReminders: boolean;
  weeklyDigest: boolean;
};

const audienceSegments = [
  { value: "schools", label: "Students (15-18)" },
  { value: "universities", label: "University Students" },
  { value: "early-career", label: "Early Career (The 9-5 Reset)" },
  { value: "builders", label: "Entrepreneurs & Creatives" },
  { value: "couples", label: "Young Couples" },
];

const contentModes = [
  { value: "reflection", label: "Reflection Mode (Seeker-friendly)" },
  { value: "faith", label: "Faith Overlay (With Scripture)" },
];

export default function Settings() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const { 
    permission, 
    isSubscribed, 
    isLoading: notifLoading, 
    subscribe, 
    unsubscribe,
    preferences: pushPreferences,
    updatePreferences: updatePushPreferences
  } = useNotifications();
  
  const { canInstall, isInstalled, installApp, isIOS, setShowIOSInstallInstructions } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [audienceSegment, setAudienceSegment] = useState<string>(user?.audienceSegment || "");
  const [contentMode, setContentMode] = useState<string>(user?.contentMode || "reflection");
  
  // Notification preferences
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [prayerSessionAlerts, setPrayerSessionAlerts] = useState(true);
  const [newSparkAlerts, setNewSparkAlerts] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
    enabled: isAuthenticated,
  });

  const { data: notifPrefs } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme || "system");
      setLanguage(settings.language || "en");
    }
    if (notifPrefs) {
      setPushEnabled(notifPrefs.pushEnabled);
      setEmailEnabled(notifPrefs.emailEnabled);
      setPrayerSessionAlerts(notifPrefs.prayerSessionAlerts);
      setNewSparkAlerts(notifPrefs.newSparkAlerts);
      setEventReminders(notifPrefs.eventReminders);
      setWeeklyDigest(notifPrefs.weeklyDigest);
    }
    if (user) {
      setAudienceSegment(user.audienceSegment || "");
      setContentMode(user.contentMode || "reflection");
    }
  }, [settings, notifPrefs, user]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      await apiRequest("PUT", "/api/user/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast.success("Settings saved");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const updateNotifPrefsMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      await apiRequest("PUT", "/api/notification-preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
    },
  });

  const updateUserPrefsMutation = useMutation({
    mutationFn: async (data: { audienceSegment?: string; contentMode?: string }) => {
      await apiRequest("PATCH", "/api/auth/user/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast.success("Preferences saved");
    },
    onError: () => {
      toast.error("Failed to save preferences");
    },
  });

  const handleThemeChange = (value: string) => {
    setTheme(value);
    updateSettingsMutation.mutate({ theme: value });
    // Apply theme to document
    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else if (value === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleNotifToggle = (key: string, value: boolean) => {
    const updates: Record<string, boolean> = { [key]: value };
    switch (key) {
      case "pushEnabled": setPushEnabled(value); break;
      case "emailEnabled": setEmailEnabled(value); break;
      case "prayerSessionAlerts": setPrayerSessionAlerts(value); break;
      case "newSparkAlerts": setNewSparkAlerts(value); break;
      case "eventReminders": setEventReminders(value); break;
      case "weeklyDigest": setWeeklyDigest(value); break;
    }
    updateNotifPrefsMutation.mutate(updates);
  };

  const handlePushSubscriptionToggle = async () => {
    setIsSubscribing(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success("Push notifications disabled");
      } else {
        const success = await subscribe();
        if (success) {
          toast.success("Push notifications enabled!");
        } else if (permission === 'denied') {
          toast.error("Please enable notifications in your browser settings");
        }
      }
    } catch (error) {
      toast.error("Failed to update push notification settings");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePushPreferenceToggle = async (key: string, value: boolean) => {
    try {
      const success = await updatePushPreferences({ [key]: value });
      if (success) {
        toast.success("Preference updated");
      } else {
        toast.error("Failed to update preference");
      }
    } catch (error) {
      toast.error("Failed to update preference");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#1a2744]">
        <Navbar />
        <main className="pt-28 pb-32 px-4">
          <div className="max-w-lg mx-auto text-center">
            <SettingsIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to access settings</h1>
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
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize your experience
            </p>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 mb-4 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-[#7C9A8E]" />
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Theme</Label>
                <div className="flex gap-2">
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "system", icon: Monitor, label: "System" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => handleThemeChange(value)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        theme === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 dark:border-[#4A7C7C]/30 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                      }`}
                      data-testid={`theme-${value}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Language</Label>
                <Select value={language} onValueChange={(v) => { setLanguage(v); updateSettingsMutation.mutate({ language: v }); }}>
                  <SelectTrigger className="w-full" data-testid="select-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Install App */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 mb-4 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-[#7C9A8E]" />
              Install App
            </h2>
            
            <div className="space-y-4">
              {isInstalled ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/30" data-testid="status-app-installed">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300" data-testid="text-install-status">App Installed</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Reawakened is installed on your device</p>
                  </div>
                </div>
              ) : canInstall ? (
                <div className="p-4 bg-white dark:bg-[#1a2744] rounded-xl border border-gray-200 dark:border-[#4A7C7C]/30">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#7C9A8E] to-[#4A7C7C] flex-shrink-0">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">Install Reawakened</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {isIOS 
                          ? "Add to your home screen for quick access and offline support"
                          : "Install the app for faster access, push notifications, and offline support"
                        }
                      </p>
                      <Button
                        onClick={async () => {
                          if (isIOS) {
                            setShowIOSInstallInstructions(true);
                          } else {
                            setIsInstalling(true);
                            const success = await installApp();
                            setIsInstalling(false);
                            if (success) {
                              toast.success("App installed successfully!");
                            }
                          }
                        }}
                        disabled={isInstalling}
                        className="bg-primary hover:bg-primary/90 text-white"
                        data-testid="button-install-app"
                      >
                        {isInstalling ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {isIOS ? "Show Install Instructions" : "Install App"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-[#1a2744] rounded-xl border border-gray-200 dark:border-[#4A7C7C]/30" data-testid="status-install-unavailable">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Install option not available. This may be because you're using a browser that doesn't support app installation, or you've already installed the app.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Content Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 mb-4 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#7C9A8E]" />
              Content Preferences
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Your Life Stage</Label>
                <Select value={audienceSegment} onValueChange={(v) => { setAudienceSegment(v); updateUserPrefsMutation.mutate({ audienceSegment: v }); }}>
                  <SelectTrigger className="w-full" data-testid="select-audience">
                    <SelectValue placeholder="Select your life stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceSegments.map(seg => (
                      <SelectItem key={seg.value} value={seg.value}>{seg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Get content tailored to your journey</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Content Mode</Label>
                <Select value={contentMode} onValueChange={(v) => { setContentMode(v); updateUserPrefsMutation.mutate({ contentMode: v }); }}>
                  <SelectTrigger className="w-full" data-testid="select-content-mode">
                    <SelectValue placeholder="Select content mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentModes.map(mode => (
                      <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Push Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 mb-4 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-[#7C9A8E]" />
              Push Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1a2744] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isSubscribed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <BellRing className={`h-5 w-5 ${isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      Browser Push Notifications
                    </Label>
                    <span className="text-xs text-gray-500">
                      {isSubscribed ? 'Enabled - you\'ll receive alerts' : permission === 'denied' ? 'Blocked by browser' : 'Enable to receive alerts'}
                    </span>
                  </div>
                </div>
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  size="sm"
                  onClick={handlePushSubscriptionToggle}
                  disabled={isSubscribing || notifLoading || permission === 'denied'}
                  className={isSubscribed ? '' : 'bg-primary hover:bg-primary/90'}
                  data-testid="button-push-toggle"
                >
                  {isSubscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    'Disable'
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>

              {permission === 'denied' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/30">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications.
                  </p>
                </div>
              )}

              {isSubscribed && (
                <div className="border-t border-gray-200 dark:border-[#4A7C7C]/20 pt-4 space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Choose what you want to be notified about:</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Daily Spark Reminders</Label>
                    </div>
                    <Switch 
                      checked={pushPreferences?.dailyReminder ?? true}
                      onCheckedChange={(v) => handlePushPreferenceToggle("dailyReminder", v)}
                      data-testid="switch-push-spark"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="h-4 w-4 text-red-500" />
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Streak Reminders</Label>
                    </div>
                    <Switch 
                      checked={pushPreferences?.streakReminders ?? true}
                      onCheckedChange={(v) => handlePushPreferenceToggle("streakReminders", v)}
                      data-testid="switch-push-streak"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Prayer Reminders</Label>
                    </div>
                    <Switch 
                      checked={pushPreferences?.prayerReminders ?? true}
                      onCheckedChange={(v) => handlePushPreferenceToggle("prayerReminders", v)}
                      data-testid="switch-push-prayer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-500" />
                      <Label className="text-sm text-gray-600 dark:text-gray-400">Community Updates</Label>
                    </div>
                    <Switch 
                      checked={pushPreferences?.communityUpdates ?? true}
                      onCheckedChange={(v) => handlePushPreferenceToggle("communityUpdates", v)}
                      data-testid="switch-push-community"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Email & In-App Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-6 border border-gray-200 dark:border-[#4A7C7C]/30"
          >
            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#7C9A8E]" />
              Email & In-App Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</Label>
                </div>
                <Switch 
                  checked={emailEnabled} 
                  onCheckedChange={(v) => handleNotifToggle("emailEnabled", v)}
                  data-testid="switch-email"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-[#4A7C7C]/20 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Prayer Session Alerts</Label>
                  </div>
                  <Switch 
                    checked={prayerSessionAlerts} 
                    onCheckedChange={(v) => handleNotifToggle("prayerSessionAlerts", v)}
                    data-testid="switch-prayer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm text-gray-600 dark:text-gray-400">New Spark Alerts</Label>
                  </div>
                  <Switch 
                    checked={newSparkAlerts} 
                    onCheckedChange={(v) => handleNotifToggle("newSparkAlerts", v)}
                    data-testid="switch-sparks"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Event Reminders</Label>
                  </div>
                  <Switch 
                    checked={eventReminders} 
                    onCheckedChange={(v) => handleNotifToggle("eventReminders", v)}
                    data-testid="switch-events"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Weekly Digest</Label>
                  </div>
                  <Switch 
                    checked={weeklyDigest} 
                    onCheckedChange={(v) => handleNotifToggle("weeklyDigest", v)}
                    data-testid="switch-digest"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
