import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft, Calendar, Users, Clock, CheckCircle2, User,
  MessageSquare, Send, BookOpen, Lightbulb, Heart, ArrowRight,
  CalendarPlus, CalendarCheck, Award
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { AICoachPanel } from "@/components/AICoachPanel";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Coach {
  id: number;
  userId: string;
  displayName: string;
  bio: string | null;
  specialties: string[] | null;
  sessionTypes: string[] | null;
  isActive: boolean;
}

interface SessionSlot {
  id: number;
  coachId: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  sessionType: string;
}

interface SessionBooking {
  id: number;
  userId: string;
  coachId: number | null;
  slotId: number | null;
  status: string;
  topic: string | null;
  goals: string | null;
  notes: string | null;
  coachNotes: string | null;
  meetingLink: string | null;
  createdAt: string;
}

export function SessionBooking() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"intro" | "browse" | "book" | "sessions">("intro");
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SessionSlot | null>(null);
  const [bookingForm, setBookingForm] = useState({
    topic: "",
    goals: "",
    notes: "",
  });

  const { data: coaches } = useQuery({
    queryKey: ["/api/coaches"],
    queryFn: async () => {
      const res = await fetch("/api/coaches", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as Coach[];
    },
  });

  const { data: slots } = useQuery({
    queryKey: ["/api/coaches", selectedCoach?.id, "slots"],
    queryFn: async () => {
      if (!selectedCoach) return [];
      const res = await fetch(`/api/coaches/${selectedCoach.id}/slots`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as SessionSlot[];
    },
    enabled: !!selectedCoach,
  });

  const { data: userSessions } = useQuery({
    queryKey: ["/api/user/sessions"],
    queryFn: async () => {
      const res = await fetch("/api/user/sessions", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as SessionBooking[];
    },
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          coachId: selectedCoach?.id,
          slotId: selectedSlot?.id,
          topic: bookingForm.topic,
          goals: bookingForm.goals,
          notes: bookingForm.notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to create booking");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/sessions"] });
      setStep("sessions");
      setSelectedCoach(null);
      setSelectedSlot(null);
      setBookingForm({ topic: "", goals: "", notes: "" });
    },
  });

  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setStep("book");
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4 py-8">
        <div className="w-20 h-20 mx-auto bg-[#7C9A8E]/20 rounded-full flex items-center justify-center">
          <Users className="w-10 h-10 text-[#7C9A8E]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Session Booking</h1>
        <p className="text-gray-600 max-w-sm mx-auto">
          Connect with experienced coaches and mentors for personalized guidance on your growth journey.
        </p>
      </div>

      <Card className="bg-[#FAF8F5] border-[#7C9A8E]/20">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#7C9A8E]" />
            How Session Booking Works
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#7C9A8E] text-white rounded-full flex items-center justify-center text-xs font-medium shrink-0">1</div>
              <p><strong>Browse Coaches</strong> - Explore available coaches and their specialties</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#7C9A8E] text-white rounded-full flex items-center justify-center text-xs font-medium shrink-0">2</div>
              <p><strong>Request a Session</strong> - Share what you'd like to discuss and your goals</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#7C9A8E] text-white rounded-full flex items-center justify-center text-xs font-medium shrink-0">3</div>
              <p><strong>Meet & Grow</strong> - Connect with your coach for meaningful conversation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#7C9A8E]/10 to-[#4A7C7C]/10 border-[#7C9A8E]/20">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D4A574]" />
            Biblical Foundation
          </h3>
          <p className="text-sm text-gray-600 italic">
            "Plans fail for lack of counsel, but with many advisers they succeed." — Proverbs 15:22
          </p>
          <p className="text-sm text-gray-600">
            God designed us to grow in community. Coaches and mentors help us see blind spots, 
            encourage us in challenges, and celebrate our victories.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          className="w-full bg-[#7C9A8E] hover:bg-[#6B8A7D] text-white py-6 text-lg"
          onClick={() => setStep("browse")}
          data-testid="button-browse-coaches"
        >
          Browse Coaches
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant="outline"
          className="w-full border-[#7C9A8E]/30 text-[#4A7C7C]"
          onClick={() => setStep("sessions")}
          data-testid="button-my-sessions"
        >
          View My Sessions
        </Button>
      </div>
    </motion.div>
  );

  const renderBrowseCoaches = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setStep("intro")}
          className="shrink-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Available Coaches</h2>
          <p className="text-sm text-gray-600">Choose someone to guide your journey</p>
        </div>
      </div>

      {coaches && coaches.length > 0 ? (
        <div className="space-y-3">
          {coaches.map((coach) => (
            <Card
              key={coach.id}
              className="border-[#7C9A8E]/20 hover:border-[#7C9A8E]/50 transition-colors cursor-pointer"
              onClick={() => handleSelectCoach(coach)}
              data-testid={`card-coach-${coach.id}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#7C9A8E]/20 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-[#7C9A8E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{coach.displayName}</h3>
                    {coach.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">{coach.bio}</p>
                    )}
                    {coach.specialties && coach.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {coach.specialties.slice(0, 3).map((specialty, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-[#7C9A8E]/10 text-[#4A7C7C]">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 self-center shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#FAF8F5] border-[#7C9A8E]/20">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Coaches Available Yet</h3>
            <p className="text-sm text-gray-500">
              Coaches are being onboarded. Check back soon or request a session anyway - 
              we'll match you with the right person.
            </p>
            <Button
              className="mt-4 bg-[#7C9A8E] hover:bg-[#6B8A7D] text-white"
              onClick={() => setStep("book")}
              data-testid="button-request-anyway"
            >
              Request Session Anyway
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderBookSession = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (selectedCoach) {
              setStep("browse");
            } else {
              setStep("intro");
            }
          }}
          className="shrink-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Request a Session</h2>
          {selectedCoach && (
            <p className="text-sm text-gray-600">with {selectedCoach.displayName}</p>
          )}
        </div>
      </div>

      {selectedCoach && slots && slots.length > 0 && (
        <Card className="border-[#7C9A8E]/20">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7C9A8E]" />
              Available Times
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {slots.slice(0, 6).map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                  className={selectedSlot?.id === slot.id 
                    ? "bg-[#7C9A8E] hover:bg-[#6B8A7D]" 
                    : "border-[#7C9A8E]/30 text-gray-700"
                  }
                  onClick={() => setSelectedSlot(slot)}
                  data-testid={`button-slot-${slot.id}`}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  {format(parseISO(slot.startTime), "MMM d, h:mm a")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#7C9A8E]/20">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">What would you like to discuss?</label>
            <Input
              placeholder="e.g., Career decisions, relationships, spiritual growth..."
              value={bookingForm.topic}
              onChange={(e) => setBookingForm(prev => ({ ...prev, topic: e.target.value }))}
              className="border-[#7C9A8E]/30"
              data-testid="input-topic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">What do you hope to achieve?</label>
            <Textarea
              placeholder="Share your goals for this session..."
              value={bookingForm.goals}
              onChange={(e) => setBookingForm(prev => ({ ...prev, goals: e.target.value }))}
              className="border-[#7C9A8E]/30 min-h-[80px]"
              data-testid="input-goals"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional notes (optional)</label>
            <Textarea
              placeholder="Anything else you'd like to share..."
              value={bookingForm.notes}
              onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
              className="border-[#7C9A8E]/30 min-h-[60px]"
              data-testid="input-notes"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-[#7C9A8E] hover:bg-[#6B8A7D] text-white py-6"
        onClick={() => createBooking.mutate()}
        disabled={!bookingForm.topic || createBooking.isPending}
        data-testid="button-submit-request"
      >
        {createBooking.isPending ? (
          <>Submitting...</>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Request
          </>
        )}
      </Button>
    </motion.div>
  );

  const renderSessions = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setStep("intro")}
          className="shrink-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Sessions</h2>
          <p className="text-sm text-gray-600">Your coaching session history</p>
        </div>
      </div>

      {userSessions && userSessions.length > 0 ? (
        <div className="space-y-3">
          {userSessions.map((session) => (
            <Card key={session.id} className="border-[#7C9A8E]/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    session.status === 'completed' ? 'bg-green-100' :
                    session.status === 'confirmed' ? 'bg-blue-100' :
                    session.status === 'cancelled' ? 'bg-gray-100' :
                    'bg-[#7C9A8E]/20'
                  }`}>
                    {session.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : session.status === 'confirmed' ? (
                      <CalendarCheck className="w-5 h-5 text-blue-600" />
                    ) : (
                      <CalendarPlus className="w-5 h-5 text-[#7C9A8E]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{session.topic || "Coaching Session"}</h3>
                      <Badge variant="secondary" className={`text-xs ${
                        session.status === 'completed' ? 'bg-green-100 text-green-700' :
                        session.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        session.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {session.status}
                      </Badge>
                    </div>
                    {session.goals && (
                      <p className="text-sm text-gray-600 line-clamp-2">{session.goals}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Requested {format(parseISO(session.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {session.meetingLink && session.status === 'confirmed' && (
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-[#4A7C7C] hover:bg-[#3A6C6C] text-white"
                    onClick={() => window.open(session.meetingLink!, '_blank')}
                    data-testid={`button-join-${session.id}`}
                  >
                    Join Meeting
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#FAF8F5] border-[#7C9A8E]/20">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Sessions Yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              You haven't requested any coaching sessions. Start your journey today!
            </p>
            <Button
              className="bg-[#7C9A8E] hover:bg-[#6B8A7D] text-white"
              onClick={() => setStep("browse")}
              data-testid="button-book-first"
            >
              Book Your First Session
            </Button>
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        className="w-full border-[#7C9A8E]/30 text-[#4A7C7C]"
        onClick={() => setStep("browse")}
        data-testid="button-book-new"
      >
        <CalendarPlus className="w-4 h-4 mr-2" />
        Book New Session
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-24 md:pb-12">
        <div className="max-w-md mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {step === "intro" && renderIntro()}
            {step === "browse" && renderBrowseCoaches()}
            {step === "book" && renderBookSession()}
            {step === "sessions" && renderSessions()}
          </AnimatePresence>
        </div>

        <AICoachPanel
          tool="sessions"
          data={{
            selectedCoach: selectedCoach?.displayName,
            topic: bookingForm.topic,
            goals: bookingForm.goals,
            step: step,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
