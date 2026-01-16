import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Mail, MessageCircle, Loader2, Check, Flame, Heart, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { COMMUNITY_LINKS } from "@/lib/config";

const categories = [
  { id: "prayer", label: "Prayer Updates", icon: Heart, color: "text-red-500" },
  { id: "missions", label: "Mission News", icon: Globe, color: "text-blue-500" },
  { id: "devotional", label: "Daily Sparks", icon: Flame, color: "text-orange-500" },
  { id: "events", label: "Event Alerts", icon: Calendar, color: "text-purple-500" },
];

interface SubscriptionCaptureProps {
  variant?: "inline" | "card" | "footer";
  title?: string;
  subtitle?: string;
  showCategories?: boolean;
  showWhatsApp?: boolean;
  className?: string;
}

export function SubscriptionCapture({
  variant = "card",
  title = "Stay Connected",
  subtitle = "Join thousands receiving weekly inspiration, mission updates, and prayer points.",
  showCategories = true,
  showWhatsApp = true,
  className = "",
}: SubscriptionCaptureProps) {
  const [email, setEmail] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["devotional"]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; categories: string[]; whatsappOptIn: boolean }) => {
      return await apiRequest<any>("POST", "/api/subscribe", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("You're subscribed! Welcome to the movement.");
      setTimeout(() => {
        setIsSuccess(false);
        setEmail("");
        setSelectedCategories(["devotional"]);
        setWhatsappOptIn(false);
      }, 3000);
    },
    onError: () => {
      toast.error("Subscription failed. Please try again.");
    },
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selectedCategories.length === 0) {
      toast.error("Please enter email and select at least one category");
      return;
    }
    subscribeMutation.mutate({ email, categories: selectedCategories, whatsappOptIn });
  };

  if (variant === "footer") {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{subtitle}</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            data-testid="input-subscribe-email-footer"
          />
          <Button
            type="submit"
            disabled={subscribeMutation.isPending || isSuccess}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-subscribe-footer"
          >
            {subscribeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </form>
        {showWhatsApp && (
          <a
            href={COMMUNITY_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            data-testid="link-whatsapp-footer"
          >
            <MessageCircle className="h-4 w-4" /> Join WhatsApp Community
          </a>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          data-testid="input-subscribe-email-inline"
        />
        <Button
          type="submit"
          disabled={subscribeMutation.isPending || isSuccess}
          className="bg-primary hover:bg-primary/90 text-white px-6"
          data-testid="button-subscribe-inline"
        >
          {subscribeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" /> Subscribed!
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${className}`}
    >
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
          <Mail className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-center"
          data-testid="input-subscribe-email-card"
        />

        {showCategories && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700 text-center">What interests you?</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                    selectedCategories.includes(cat.id)
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                  data-testid={`button-category-${cat.id}`}
                >
                  <cat.icon className={`h-3.5 w-3.5 ${selectedCategories.includes(cat.id) ? cat.color : ""}`} />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showWhatsApp && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
            <Checkbox
              id="whatsapp-optin"
              checked={whatsappOptIn}
              onCheckedChange={(checked) => setWhatsappOptIn(checked as boolean)}
              data-testid="checkbox-whatsapp-optin"
            />
            <label htmlFor="whatsapp-optin" className="text-xs text-gray-700 cursor-pointer">
              Also send me updates via <span className="text-green-600 font-medium">WhatsApp</span>
            </label>
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-5 bg-primary hover:bg-primary/90"
          disabled={subscribeMutation.isPending || isSuccess}
          data-testid="button-subscribe-card"
        >
          {subscribeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Subscribing...
            </>
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" /> You're In!
            </>
          ) : (
            "Join the Movement"
          )}
        </Button>
      </form>

      {showWhatsApp && (
        <div className="mt-4 text-center">
          <span className="text-gray-400 text-xs">or</span>
          <a
            href={COMMUNITY_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-2 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
            data-testid="link-whatsapp-card"
          >
            <MessageCircle className="h-4 w-4" /> Join Our WhatsApp Community
          </a>
        </div>
      )}
    </motion.div>
  );
}
