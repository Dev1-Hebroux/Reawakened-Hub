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
  const [urgencyLevel, setUrgencyLevel] = useState("normal");
  const [category, setCategory] = useState("");
  const [campusOrCity, setCampusOrCity] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const urgencyOptions = [
    { value: "normal", label: "Normal" },
    { value: "urgent", label: "Urgent" },
    { value: "critical", label: "Critical - Need prayer now" },
  ];

  const categoryOptions = [
    { value: "healing", label: "Healing" },
    { value: "provision", label: "Provision" },
    { value: "guidance", label: "Guidance" },
    { value: "relationships", label: "Relationships" },
    { value: "salvation", label: "Salvation" },
    { value: "anxiety", label: "Anxiety / Peace" },
    { value: "other", label: "Other" },
  ];

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email: string; request: string; isPrivate: boolean; urgencyLevel: string; category: string; campusOrCity?: string }) => {
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
        setUrgencyLevel("normal");
        setCategory("");
        setCampusOrCity("");
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
    mutation.mutate({ name, email, request, isPrivate, urgencyLevel, category, campusOrCity: campusOrCity || undefined });
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
            Share your need and let our community stand with you in prayer. Your request will be sent to our dedicated prayer team who will intercede for you daily.
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">What do you need prayer for?</label>
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
                  data-testid={`button-prayer-category-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Share your prayer request... *"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={4}
            data-testid="input-prayer-request"
          />

          <Input
            placeholder="Your campus or city (optional)"
            value={campusOrCity}
            onChange={(e) => setCampusOrCity(e.target.value)}
            data-testid="input-prayer-campus"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">How urgent is this?</label>
            <div className="flex flex-wrap gap-2">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgencyLevel(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    urgencyLevel === opt.value
                      ? opt.value === "critical" ? "bg-red-500 text-white" : opt.value === "urgent" ? "bg-orange-500 text-white" : "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid={`button-prayer-urgency-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

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
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState("salvation");
  const [sharingPermission, setSharingPermission] = useState("private");
  const [displayNamePreference, setDisplayNamePreference] = useState("first_name");
  const [isSuccess, setIsSuccess] = useState(false);

  const categoryOptions = [
    { value: "salvation", label: "Salvation" },
    { value: "healing", label: "Healing" },
    { value: "provision", label: "Provision" },
    { value: "deliverance", label: "Deliverance" },
    { value: "breakthrough", label: "Breakthrough" },
    { value: "other", label: "Other" },
  ];

  const sharingOptions = [
    { value: "private", label: "Keep private (just for review)" },
    { value: "anonymous", label: "Share anonymously" },
    { value: "public", label: "Share publicly with my name" },
  ];

  const displayOptions = [
    { value: "first_name", label: "First name only" },
    { value: "full_name", label: "Full name" },
    { value: "anonymous", label: "Anonymous" },
  ];

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email?: string; title: string; story: string; category: string; sharingPermission: string; displayNamePreference: string }) => {
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
        setEmail("");
        setTitle("");
        setStory("");
        setCategory("salvation");
        setSharingPermission("private");
        setDisplayNamePreference("first_name");
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
    mutation.mutate({ name, email: email || undefined, title, story, category, sharingPermission, displayNamePreference });
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
            type="email"
            placeholder="Email (for confirmation)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="input-testimony-email"
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Would you like us to share your testimony?</label>
            <div className="flex flex-wrap gap-2">
              {sharingOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSharingPermission(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sharingPermission === opt.value
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid={`button-testimony-sharing-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {sharingPermission !== "private" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">How should we display your name?</label>
              <div className="flex flex-wrap gap-2">
                {displayOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDisplayNamePreference(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      displayNamePreference === opt.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    data-testid={`button-testimony-display-${opt.value}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
  const [segment, setSegment] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const segmentOptions = [
    { value: "sixth_form", label: "Sixth Form / College" },
    { value: "university", label: "University" },
    { value: "early_career", label: "Early Career / Young Professional" },
  ];

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
    mutationFn: async (data: { name: string; email: string; phone?: string; segment?: string; areas: string[] }) => {
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
        setSegment("");
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
    mutation.mutate({ name, email, phone: phone || undefined, segment: segment || undefined, areas });
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
            <label className="text-sm font-medium text-gray-700">Where are you at in life?</label>
            <div className="flex flex-wrap gap-2">
              {segmentOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSegment(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    segment === opt.value
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid={`button-volunteer-segment-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
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
