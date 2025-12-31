import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronLeft, Users, Calendar, Target, MessageCircle,
  CheckCircle2, ArrowRight, BookOpen, Heart, Brain,
  Sparkles, Clock, Video, Star, Lightbulb, Flame,
  Award, Crown, Shield, Zap
} from "lucide-react";
import { format, addDays } from "date-fns";
import { AICoachPanel } from "@/components/AICoachPanel";

interface GroupLab {
  id: number;
  title: string;
  description: string;
  topic: string;
  facilitator: string;
  maxParticipants: number;
  currentParticipants: number;
  scheduledDate: Date;
  duration: number;
  status: "upcoming" | "in-progress" | "completed";
}

const DEMO_LABS: GroupLab[] = [
  {
    id: 1,
    title: "Discovering Your Strengths",
    description: "A guided session to uncover your unique character strengths and how to apply them daily.",
    topic: "strengths",
    facilitator: "Coach Sarah",
    maxParticipants: 12,
    currentParticipants: 8,
    scheduledDate: addDays(new Date(), 3),
    duration: 60,
    status: "upcoming",
  },
  {
    id: 2,
    title: "Communication Styles Workshop",
    description: "Learn how different personality types communicate and how to connect better with others.",
    topic: "communication",
    facilitator: "Coach Michael",
    maxParticipants: 10,
    currentParticipants: 6,
    scheduledDate: addDays(new Date(), 7),
    duration: 75,
    status: "upcoming",
  },
  {
    id: 3,
    title: "Goal Setting Masterclass",
    description: "Create SMART goals aligned with your values and build an actionable 90-day plan.",
    topic: "goals",
    facilitator: "Coach Rachel",
    maxParticipants: 15,
    currentParticipants: 11,
    scheduledDate: addDays(new Date(), 10),
    duration: 90,
    status: "upcoming",
  },
  {
    id: 4,
    title: "Faith & Purpose Lab",
    description: "Explore how your faith informs your calling and discover your unique purpose.",
    topic: "faith",
    facilitator: "Pastor James",
    maxParticipants: 20,
    currentParticipants: 15,
    scheduledDate: addDays(new Date(), 14),
    duration: 60,
    status: "upcoming",
  },
];

const TOPIC_ICONS: Record<string, any> = {
  strengths: Star,
  communication: MessageCircle,
  goals: Target,
  faith: BookOpen,
  leadership: Crown,
  emotions: Heart,
};

const TOPIC_COLORS: Record<string, string> = {
  strengths: "from-[#D4A574] to-[#C49464]",
  communication: "from-[#7C9A8E] to-[#6B8B7E]",
  goals: "from-[#4A7C7C] to-[#3A6C6C]",
  faith: "from-[#D4A574] to-[#C49464]",
  leadership: "from-[#8B7355] to-[#7A6345]",
  emotions: "from-[#4A7C7C] to-[#3A6C6C]",
};

export function GroupLabs() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedLab, setSelectedLab] = useState<GroupLab | null>(null);
  const [step, setStep] = useState<"browse" | "details" | "registered" | "my-labs">("browse");
  const [registeredLabs, setRegisteredLabs] = useState<number[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "my-labs">("all");

  const handleRegister = (labId: number) => {
    setRegisteredLabs(prev => [...prev, labId]);
    setStep("registered");
  };

  const handleUnregister = (labId: number) => {
    setRegisteredLabs(prev => prev.filter(id => id !== labId));
    setSelectedLab(null);
    setStep("browse");
  };

  const myRegisteredLabs = DEMO_LABS.filter(lab => registeredLabs.includes(lab.id));
  const filteredLabs = filter === "my-labs" 
    ? myRegisteredLabs 
    : DEMO_LABS.filter(lab => filter === "all" || lab.status === filter);

  const renderBrowse = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#2C3E2D] mb-2">Group Labs</h1>
        <p className="text-[#6B7B6E]">
          Learn and grow together in facilitated group sessions
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: "all", label: "All Labs" },
          { key: "upcoming", label: "Upcoming" },
          { key: "my-labs", label: `My Labs${myRegisteredLabs.length > 0 ? ` (${myRegisteredLabs.length})` : ""}` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-[#7C9A8E] text-white"
                : "bg-white text-[#6B7B6E] border border-[#E8E4DE]"
            }`}
            data-testid={`filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredLabs.length === 0 ? (
        <Card className="bg-[#FAF8F5] border-[#E8E4DE]">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-[#6B7B6E] mx-auto mb-4" />
            <p className="text-[#6B7B6E]">
              {filter === "my-labs" 
                ? "You haven't registered for any labs yet." 
                : "No labs available at the moment."}
            </p>
            {filter === "my-labs" && (
              <Button
                onClick={() => setFilter("all")}
                variant="outline"
                className="mt-4"
              >
                Browse Labs
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLabs.map((lab) => {
            const Icon = TOPIC_ICONS[lab.topic] || Lightbulb;
            const color = TOPIC_COLORS[lab.topic] || "from-[#7C9A8E] to-[#6B8B7E]";
            const isRegistered = registeredLabs.includes(lab.id);
            const spotsLeft = lab.maxParticipants - lab.currentParticipants;

            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className={`bg-white border-[#E8E4DE] cursor-pointer hover:shadow-md transition-all ${
                    isRegistered ? "ring-2 ring-[#7C9A8E]" : ""
                  }`}
                  onClick={() => {
                    setSelectedLab(lab);
                    setStep("details");
                  }}
                  data-testid={`lab-card-${lab.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#2C3E2D] truncate">{lab.title}</h3>
                          {isRegistered && (
                            <Badge className="bg-[#7C9A8E] text-white text-xs">Registered</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#6B7B6E] line-clamp-2 mb-2">{lab.description}</p>
                        <div className="flex items-center gap-4 text-xs text-[#8B9B8E]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(lab.scheduledDate, "MMM d")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lab.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => navigate("/growth")}
        className="w-full mt-6 border-[#E8E4DE] text-[#6B7B6E]"
        data-testid="button-back"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Growth Hub
      </Button>
    </motion.div>
  );

  const renderDetails = () => {
    if (!selectedLab) return null;
    const Icon = TOPIC_ICONS[selectedLab.topic] || Lightbulb;
    const color = TOPIC_COLORS[selectedLab.topic] || "from-[#7C9A8E] to-[#6B8B7E]";
    const isRegistered = registeredLabs.includes(selectedLab.id);
    const spotsLeft = selectedLab.maxParticipants - selectedLab.currentParticipants;
    const isFull = spotsLeft <= 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4"
      >
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#2C3E2D] mb-2">{selectedLab.title}</h1>
          <p className="text-[#6B7B6E] text-sm">{selectedLab.description}</p>
        </div>

        <Card className="bg-white border-[#E8E4DE] mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-[#8B9B8E]">Date</span>
                <p className="font-medium text-[#2C3E2D]">
                  {format(selectedLab.scheduledDate, "EEEE, MMM d")}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#8B9B8E]">Duration</span>
                <p className="font-medium text-[#2C3E2D]">{selectedLab.duration} minutes</p>
              </div>
              <div>
                <span className="text-xs text-[#8B9B8E]">Facilitator</span>
                <p className="font-medium text-[#2C3E2D]">{selectedLab.facilitator}</p>
              </div>
              <div>
                <span className="text-xs text-[#8B9B8E]">Participants</span>
                <p className="font-medium text-[#2C3E2D]">
                  {selectedLab.currentParticipants}/{selectedLab.maxParticipants}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#7C9A8E]/10 border-[#7C9A8E]/20 mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-[#2C3E2D] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C9A8E]" />
              What You'll Learn
            </h3>
            <ul className="space-y-2 text-sm text-[#6B7B6E]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Practical tools and frameworks you can apply immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Connect with like-minded people on similar journeys</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Interactive exercises and group discussions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Follow-up resources to continue your growth</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLab(null);
              setStep("browse");
            }}
            className="flex-1 border-[#E8E4DE] text-[#6B7B6E]"
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {isRegistered ? (
            <Button
              variant="outline"
              onClick={() => handleUnregister(selectedLab.id)}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              data-testid="button-unregister"
            >
              Cancel Registration
            </Button>
          ) : (
            <Button
              onClick={() => handleRegister(selectedLab.id)}
              disabled={isFull}
              className="flex-1 bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] text-white disabled:opacity-50"
              data-testid="button-register"
            >
              {isFull ? "Lab Full" : "Register Now"}
              <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderRegistered = () => {
    if (!selectedLab) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center px-4"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">You're Registered!</h1>
        <p className="text-[#6B7B6E] mb-2">{selectedLab.title}</p>
        <p className="text-sm text-[#8B9B8E] mb-6">
          {format(selectedLab.scheduledDate, "EEEE, MMMM d 'at' h:mm a")}
        </p>

        <Card className="bg-[#7C9A8E]/10 border-[#7C9A8E]/20 mb-6">
          <CardContent className="p-6">
            <h3 className="font-medium text-[#2C3E2D] mb-3">Before the Lab:</h3>
            <ul className="space-y-2 text-left text-sm text-[#6B7B6E]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Add this to your calendar</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Find a quiet space with good internet</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Prepare a notebook for insights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
                <span>Come ready to participate and share</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={() => {
              setSelectedLab(null);
              setStep("browse");
              setFilter("my-labs");
            }}
            className="w-full bg-gradient-to-r from-[#7C9A8E] to-[#6B8B7E] text-white"
            data-testid="button-view-my-labs"
          >
            View My Labs
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLab(null);
              setStep("browse");
            }}
            className="w-full border-[#E8E4DE]"
            data-testid="button-browse-more"
          >
            Browse More Labs
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-24 md:pb-12">
        <div className="max-w-md mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {step === "browse" && renderBrowse()}
            {step === "details" && renderDetails()}
            {step === "registered" && renderRegistered()}
          </AnimatePresence>
        </div>

        <AICoachPanel
          tool="group-labs"
          data={{
            selectedLab: selectedLab?.title,
            registeredLabs: registeredLabs.length,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
