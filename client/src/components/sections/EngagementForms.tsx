import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Check, Heart, BookOpen, Users, Plane, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrayerRequestModal({ open, onOpenChange }: FormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email: string; request: string; isPrivate: boolean }) => {
      const res = await apiRequest("POST", "/api/prayer-requests", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Prayer request submitted. We're standing with you!");
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        setName("");
        setEmail("");
        setRequest("");
        setIsPrivate(false);
      }, 2000);
    },
    onError: () => {
      toast.error("Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !request) {
      toast.error("Please fill in required fields");
      return;
    }
    mutation.mutate({ name, email, request, isPrivate });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-100">
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle className="text-xl">Submit a Prayer Request</DialogTitle>
          </div>
          <DialogDescription>
            Share your need and let our community stand with you in prayer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="input-prayer-name"
          />
          <Input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-prayer-email"
          />
          <Textarea
            placeholder="Share your prayer request... *"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={4}
            data-testid="input-prayer-request"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              data-testid="checkbox-prayer-private"
            />
            <label htmlFor="private" className="text-sm text-gray-600">
              Keep this request private (only prayer team sees it)
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending || isSuccess}
            data-testid="button-submit-prayer"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isSuccess ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {isSuccess ? "Submitted!" : "Submit Prayer Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TestimonyModal({ open, onOpenChange }: FormModalProps) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState("salvation");
  const [isSuccess, setIsSuccess] = useState(false);

  const categoryOptions = [
    { value: "salvation", label: "Salvation" },
    { value: "healing", label: "Healing" },
    { value: "provision", label: "Provision" },
    { value: "deliverance", label: "Deliverance" },
    { value: "breakthrough", label: "Breakthrough" },
    { value: "other", label: "Other" },
  ];

  const mutation = useMutation({
    mutationFn: async (data: { name: string; title: string; story: string; category: string }) => {
      const res = await apiRequest("POST", "/api/testimonies", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Testimony submitted! God is good!");
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        setName("");
        setTitle("");
        setStory("");
        setCategory("salvation");
      }, 2000);
    },
    onError: () => {
      toast.error("Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !story) {
      toast.error("Please fill in all fields");
      return;
    }
    mutation.mutate({ name, title, story, category });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-orange-100">
              <BookOpen className="h-5 w-5 text-orange-500" />
            </div>
            <DialogTitle className="text-xl">Share Your Testimony</DialogTitle>
          </div>
          <DialogDescription>
            Tell us what God has done in your life. Your story can encourage others!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="input-testimony-name"
          />
          <Input
            placeholder="Title of your testimony *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-testimony-title"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === opt.value
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid={`button-testimony-category-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Share your story... *"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={5}
            data-testid="input-testimony-story"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending || isSuccess}
            data-testid="button-submit-testimony"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isSuccess ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {isSuccess ? "Submitted!" : "Share Testimony"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VolunteerModal({ open, onOpenChange }: FormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const volunteerAreas = [
    "Media & Tech",
    "Worship",
    "Prayer Team",
    "Outreach",
    "Children & Youth",
    "Hospitality",
    "Admin & Comms",
    "Creative Arts",
  ];

  const toggleArea = (area: string) => {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; areas: string[] }) => {
      const res = await apiRequest("POST", "/api/volunteer", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Thank you for volunteering! We'll be in touch.");
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        setName("");
        setEmail("");
        setPhone("");
        setAreas([]);
      }, 2000);
    },
    onError: () => {
      toast.error("Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || areas.length === 0) {
      toast.error("Please fill in required fields and select at least one area");
      return;
    }
    mutation.mutate({ name, email, phone: phone || undefined, areas });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-purple-100">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <DialogTitle className="text-xl">Join Our Volunteer Team</DialogTitle>
          </div>
          <DialogDescription>
            Use your gifts to serve and build the kingdom. Every role matters!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="input-volunteer-name"
          />
          <Input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-volunteer-email"
          />
          <Input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="input-volunteer-phone"
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Areas of Interest *</label>
            <div className="flex flex-wrap gap-2">
              {volunteerAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    areas.includes(area)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid={`button-volunteer-area-${area.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending || isSuccess}
            data-testid="button-submit-volunteer"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isSuccess ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {isSuccess ? "Submitted!" : "Sign Up to Volunteer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MissionTripModal({ open, onOpenChange }: FormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tripInterest, setTripInterest] = useState("");
  const [experience, setExperience] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const tripOptions = [
    "Short-term Mission (1-2 weeks)",
    "Medium-term Mission (1-3 months)",
    "Long-term Mission (6+ months)",
    "Local Outreach Projects",
    "Medical Missions",
    "Teaching/Training Missions",
  ];

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone?: string; tripInterest: string; experience?: string }) => {
      const res = await apiRequest("POST", "/api/mission-registration", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Registration received! Our team will contact you.");
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        setName("");
        setEmail("");
        setPhone("");
        setTripInterest("");
        setExperience("");
      }, 2000);
    },
    onError: () => {
      toast.error("Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !tripInterest) {
      toast.error("Please fill in required fields");
      return;
    }
    mutation.mutate({ name, email, phone: phone || undefined, tripInterest, experience: experience || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-blue-100">
              <Plane className="h-5 w-5 text-blue-500" />
            </div>
            <DialogTitle className="text-xl">Register for Missions</DialogTitle>
          </div>
          <DialogDescription>
            Go into all the world! Take the first step toward your mission journey.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="input-mission-name"
          />
          <Input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-mission-email"
          />
          <Input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            data-testid="input-mission-phone"
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Trip Interest *</label>
            <div className="flex flex-wrap gap-2">
              {tripOptions.map((trip) => (
                <button
                  key={trip}
                  type="button"
                  onClick={() => setTripInterest(trip)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    tripInterest === trip
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid={`button-mission-trip-${trip.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                >
                  {trip}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Tell us about any mission experience (optional)"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={3}
            data-testid="input-mission-experience"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending || isSuccess}
            data-testid="button-submit-mission"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isSuccess ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {isSuccess ? "Submitted!" : "Register Interest"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
