import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ChevronLeft, Users, Calendar, Target, MessageCircle,
  CheckCircle2, ArrowRight, BookOpen, Heart, Brain,
  Clock, Video, Star, Lightbulb, Flame
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { AICoachPanel } from "@/components/AICoachPanel";

interface Coach {
  id: number;
  userId: string;
  displayName: string;
  bio: string | null;
  specialties: string[] | null;
  isActive: boolean;
}

interface Booking {
  id: number;
  userId: string;
  coachId: number | null;
  status: string;
  topic: string | null;
  goals: string | null;
  notes: string | null;
  meetingLink: string | null;
  createdAt: string;
}

const COACHING_TOPICS = [
  { key: "purpose", label: "Finding Purpose", icon: Target, desc: "Discover your calling and life direction" },
  { key: "goals", label: "Goal Setting", icon: CheckCircle2, desc: "Set and achieve meaningful objectives" },
  { key: "relationships", label: "Relationships", icon: Heart, desc: "Improve connections with others" },
  { key: "faith", label: "Faith Journey", icon: BookOpen, desc: "Deepen your spiritual walk" },
  { key: "career", label: "Career Direction", icon: Brain, desc: "Navigate work and vocation" },
  { key: "habits", label: "Habits & Growth", icon: Flame, desc: "Build life-changing routines" },
];

const PREP_QUESTIONS = [
  "What's the main thing you want to work on?",
  "What have you already tried?",
  "What's holding you back?",
  "What would success look like for you?",
];

export function CoachingLabs() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"intro" | "topics" | "prep" | "coaches" | "review" | "booked" | "sessions">("intro");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [prepAnswers, setPrepAnswers] = useState<Map<number, string>>(new Map());
  const [currentPrepIndex, setCurrentPrepIndex] = useState(0);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [goals, setGoals] = useState("");

  const { data: coaches } = useQuery({
    queryKey: ["/api/coaches"],
    queryFn: async () => {
      const res = await fetch("/api/coaches", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as Coach[];
    },
  });

  const { data: myBookings } = useQuery({
    queryKey: ["/api/user/session-bookings"],
    queryFn: async () => {
      const res = await fetch("/api/user/session-bookings", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as Booking[];
    },
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      const topic = COACHING_TOPICS.find(t => t.key === selectedTopic);
      const res = await fetch("/api/session-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          coachId: selectedCoachId,
          topic: topic?.label || selectedTopic,
          goals: goals,
          notes: Array.from(prepAnswers.entries())
            .map(([idx, answer]) => `${PREP_QUESTIONS[idx]}\n${answer}`)
            .join("\n\n"),
          status: "requested",
        }),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/session-bookings"] });
      setStep("booked");
    },
  });

  const activeBookings = myBookings?.filter(b => b.status !== "completed" && b.status !== "cancelled") || [];
  const pastBookings = myBookings?.filter(b => b.status === "completed") || [];

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center px-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Video className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">1:1 Coaching Lab</h1>
      <p className="text-[#6B7B6E] mb-6 text-lg">
        Get personalized guidance from a trained coach or mentor
      </p>

      <Card className="bg-[#4A7C7C]/10 border-[#4A7C7C]/20 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-[#4A7C7C]" />
            <span className="font-medium text-[#2C3E2D]">What to Expect</span>
          </div>
          <ul className="space-y-3 text-left text-sm text-[#6B7B6E]">
            <li className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#4A7C7C] mt-0.5 flex-shrink-0" />
              <span>30-60 minute sessions via video call</span>
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-4 h-4 text-[#4A7C7C] mt-0.5 flex-shrink-0" />
              <span>Focused on your specific goals and challenges</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-4 h-4 text-[#4A7C7C] mt-0.5 flex-shrink-0" />
              <span>Safe, confidential, faith-centered guidance</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {activeBookings.length > 0 && (
        <Button
          variant="outline"
          onClick={() => setStep("sessions")}
          className="w-full mb-3 border-[#4A7C7C] text-[#4A7C7C]"
          data-testid="button-view-sessions"
        >
          View My Sessions ({activeBookings.length})
        </Button>
      )}

      <Button
        onClick={() => setStep("topics")}
        className="w-full bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] hover:opacity-90 text-white py-4 rounded-full text-lg font-medium"
        data-testid="button-start"
      >
        Start Coaching Journey <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  const renderTopics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#2C3E2D] mb-2">What would you like to work on?</h2>
        <p className="text-sm text-[#6B7B6E]">Select a topic to get matched with the right coach</p>
      </div>

      <div className="space-y-3 mb-6">
        {COACHING_TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isSelected = selectedTopic === topic.key;
          return (
            <button
              key={topic.key}
              onClick={() => setSelectedTopic(topic.key)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all touch-manipulation ${
                isSelected
                  ? "border-[#4A7C7C] bg-[#4A7C7C]/10"
                  : "border-[#E8E4DE] bg-white hover:border-[#4A7C7C]/50"
              }`}
              data-testid={`topic-${topic.key}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-[#4A7C7C]" : "bg-[#4A7C7C]/20"
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#4A7C7C]"}`} />
                </div>
                <div>
                  <span className="font-medium text-[#2C3E2D]">{topic.label}</span>
                  <p className="text-xs text-[#6B7B6E]">{topic.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep("intro")}
          className="flex-1 border-[#E8E4DE] text-[#6B7B6E]"
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={() => setStep("prep")}
          disabled={!selectedTopic}
          className="flex-1 bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] text-white disabled:opacity-50"
          data-testid="button-next"
        >
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );

  const renderPrep = () => {
    const currentQuestion = PREP_QUESTIONS[currentPrepIndex];
    const currentAnswer = prepAnswers.get(currentPrepIndex) || "";
    const progress = ((currentPrepIndex + 1) / PREP_QUESTIONS.length) * 100;

    return (
      <motion.div
        key={currentPrepIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4"
      >
        <div className="mb-6">
          <Progress value={progress} className="h-2 mb-2" />
          <span className="text-xs text-[#6B7B6E]">
            Question {currentPrepIndex + 1} of {PREP_QUESTIONS.length}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#2C3E2D]">{currentQuestion}</h2>
        </div>

        <Textarea
          value={currentAnswer}
          onChange={(e) => {
            const next = new Map(prepAnswers);
            next.set(currentPrepIndex, e.target.value);
            setPrepAnswers(next);
          }}
          placeholder="Take a moment to reflect..."
          className="min-h-[120px] mb-6 bg-white border-[#E8E4DE]"
          data-testid="textarea-prep-answer"
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (currentPrepIndex > 0) {
                setCurrentPrepIndex(prev => prev - 1);
              } else {
                setStep("topics");
              }
            }}
            className="flex-1 border-[#E8E4DE] text-[#6B7B6E]"
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            onClick={() => {
              if (currentPrepIndex < PREP_QUESTIONS.length - 1) {
                setCurrentPrepIndex(prev => prev + 1);
              } else {
                setStep("coaches");
              }
            }}
            className="flex-1 bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] text-white"
            data-testid="button-next"
          >
            {currentPrepIndex < PREP_QUESTIONS.length - 1 ? "Next" : "Find Coach"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderCoaches = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#2C3E2D] mb-2">Choose Your Coach</h2>
        <p className="text-sm text-[#6B7B6E]">Select someone who resonates with you</p>
      </div>

      {!coaches || coaches.length === 0 ? (
        <Card className="bg-[#FAF8F5] border-[#E8E4DE] mb-6">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-[#6B7B6E] mx-auto mb-4" />
            <p className="text-[#6B7B6E]">
              No coaches available at the moment. Your request will be matched with the next available coach.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto">
          {coaches.map((coach) => (
            <button
              key={coach.id}
              onClick={() => setSelectedCoachId(coach.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedCoachId === coach.id
                  ? "border-[#4A7C7C] bg-[#4A7C7C]/10"
                  : "border-[#E8E4DE] bg-white hover:border-[#4A7C7C]/50"
              }`}
              data-testid={`coach-${coach.id}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A7C7C] to-[#3A6C6C] flex items-center justify-center text-white font-bold">
                  {coach.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#2C3E2D]">{coach.displayName}</h3>
                  <p className="text-sm text-[#6B7B6E] line-clamp-2">{coach.bio || "Experienced coach ready to help you grow."}</p>
                  {coach.specialties && coach.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {coach.specialties.slice(0, 3).map((spec, i) => (
                        <span key={i} className="text-xs bg-[#4A7C7C]/10 text-[#4A7C7C] px-2 py-0.5 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentPrepIndex(PREP_QUESTIONS.length - 1);
            setStep("prep");
          }}
          className="flex-1 border-[#E8E4DE] text-[#6B7B6E]"
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={() => setStep("review")}
          className="flex-1 bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] text-white"
          data-testid="button-next"
        >
          Review Request <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );

  const renderReview = () => {
    const topic = COACHING_TOPICS.find(t => t.key === selectedTopic);
    const coach = coaches?.find(c => c.id === selectedCoachId);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#2C3E2D] mb-2">Review Your Request</h2>
          <p className="text-sm text-[#6B7B6E]">Almost there! Add any final goals</p>
        </div>

        <Card className="bg-white border-[#E8E4DE] mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {topic && <topic.icon className="w-5 h-5 text-[#4A7C7C]" />}
              <span className="font-medium text-[#2C3E2D]">{topic?.label || "General Coaching"}</span>
            </div>
            {coach && (
              <div className="flex items-center gap-2 text-sm text-[#6B7B6E]">
                <Users className="w-4 h-4" />
                <span>with {coach.displayName}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2C3E2D] mb-2">
            What do you hope to achieve from this session?
          </label>
          <Textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g., I want to get clarity on my next career step..."
            className="min-h-[100px] bg-white border-[#E8E4DE]"
            data-testid="textarea-goals"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep("coaches")}
            className="flex-1 border-[#E8E4DE] text-[#6B7B6E]"
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            onClick={() => createBooking.mutate()}
            disabled={createBooking.isPending}
            className="flex-1 bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] text-white disabled:opacity-50"
            data-testid="button-submit"
          >
            {createBooking.isPending ? "Submitting..." : "Request Session"}
            <CheckCircle2 className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderBooked = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center px-4"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7C9A8E] to-[#6B8B7E] flex items-center justify-center mx-auto mb-6 shadow-lg">
        <CheckCircle2 className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[#2C3E2D] mb-3">Request Submitted!</h1>
      <p className="text-[#6B7B6E] mb-6">
        Your coach will reach out to confirm a time that works for you.
      </p>

      <Card className="bg-[#7C9A8E]/10 border-[#7C9A8E]/20 mb-6">
        <CardContent className="p-6">
          <h3 className="font-medium text-[#2C3E2D] mb-3">While you wait:</h3>
          <ul className="space-y-2 text-left text-sm text-[#6B7B6E]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
              <span>Review your prep notes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
              <span>Complete your Vision Pathway exercises</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7C9A8E] mt-0.5" />
              <span>Pray for openness and growth</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={() => setStep("sessions")}
          className="w-full bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] text-white"
          data-testid="button-view-sessions"
        >
          View My Sessions
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/vision")}
          className="w-full border-[#E8E4DE]"
          data-testid="button-back-vision"
        >
          Back to Vision Hub
        </Button>
      </div>
    </motion.div>
  );

  const renderSessions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#2C3E2D] mb-2">My Coaching Sessions</h2>
      </div>

      {activeBookings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#6B7B6E] mb-3">Active Sessions</h3>
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <Card key={booking.id} className="bg-white border-[#E8E4DE]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#2C3E2D]">{booking.topic || "Coaching Session"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                      booking.status === "requested" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7B6E]">
                    {format(parseISO(booking.createdAt), "PPP")}
                  </p>
                  {booking.meetingLink && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#4A7C7C] hover:underline mt-2 flex items-center gap-1"
                    >
                      <Video className="w-4 h-4" /> Join Meeting
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#6B7B6E] mb-3">Past Sessions</h3>
          <div className="space-y-3">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="bg-gray-50 border-[#E8E4DE]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#6B7B6E]">{booking.topic || "Coaching Session"}</span>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-sm text-[#8B9B8E]">
                    {format(parseISO(booking.createdAt), "PPP")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate("/growth")}
          className="flex-1 border-[#E8E4DE] text-[#6B7B6E]"
          data-testid="button-back"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={() => {
            setStep("intro");
            setSelectedTopic(null);
            setSelectedCoachId(null);
            setPrepAnswers(new Map());
            setCurrentPrepIndex(0);
            setGoals("");
          }}
          className="flex-1 bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] text-white"
          data-testid="button-new-session"
        >
          Request New Session
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-24 md:pb-12">
        <div className="max-w-md mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {step === "intro" && renderIntro()}
            {step === "topics" && renderTopics()}
            {step === "prep" && renderPrep()}
            {step === "coaches" && renderCoaches()}
            {step === "review" && renderReview()}
            {step === "booked" && renderBooked()}
            {step === "sessions" && renderSessions()}
          </AnimatePresence>
        </div>

        <AICoachPanel
          tool="coaching"
          data={{
            topic: selectedTopic,
            prepAnswers: Object.fromEntries(prepAnswers),
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
