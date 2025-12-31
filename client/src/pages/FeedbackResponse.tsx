import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft, ChevronRight, CheckCircle2, MessageCircle,
  Heart, Shield, Star, Send
} from "lucide-react";

const DIMENSIONS: Record<string, { label: string; questions: string[] }> = {
  communication: {
    label: "Communication",
    questions: [
      "How clearly does this person express their ideas?",
      "How well does this person listen to others?",
    ]
  },
  leadership: {
    label: "Leadership",
    questions: [
      "How effectively does this person guide and inspire others?",
      "How well does this person support team members?",
    ]
  },
  collaboration: {
    label: "Collaboration",
    questions: [
      "How well does this person work with others toward shared goals?",
      "How open is this person to others' ideas and input?",
    ]
  },
  reliability: {
    label: "Reliability",
    questions: [
      "How consistently does this person follow through on commitments?",
      "How dependable is this person when you need them?",
    ]
  },
  empathy: {
    label: "Empathy",
    questions: [
      "How well does this person understand others' feelings?",
      "How caring and supportive is this person?",
    ]
  },
  initiative: {
    label: "Initiative",
    questions: [
      "How proactively does this person take action?",
      "How well does this person identify and solve problems?",
    ]
  },
  adaptability: {
    label: "Adaptability",
    questions: [
      "How well does this person handle change?",
      "How flexible is this person in new situations?",
    ]
  },
  integrity: {
    label: "Integrity",
    questions: [
      "How honest and trustworthy is this person?",
      "How consistent are their actions with their values?",
    ]
  },
};

interface Answer {
  questionKey: string;
  rating: number;
  comment: string;
}

export function FeedbackResponse() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"loading" | "intro" | "questions" | "complete" | "error">("loading");
  const [currentDimIndex, setCurrentDimIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/feedback/respond", token],
    queryFn: async () => {
      const res = await fetch(`/api/feedback/respond/${token}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to load feedback");
      }
      return res.json();
    },
    retry: false,
  });

  const submitFeedback = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/feedback/respond/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      return res.json();
    },
    onSuccess: () => {
      setStep("complete");
    },
  });

  if (isLoading && step === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#4A7C7C] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error || (data && !data.ok)) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Form</h2>
            <p className="text-gray-600">
              {(error as Error)?.message || "This feedback link may have expired or already been used."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invite = data?.data?.invite;
  const campaign = data?.data?.campaign;
  const dimensions = campaign?.focusDimensions || [];

  const handleNext = () => {
    if (currentRating > 0) {
      const dimKey = dimensions[currentDimIndex];
      setAnswers(prev => [...prev, {
        questionKey: dimKey,
        rating: currentRating,
        comment: currentComment,
      }]);
      setCurrentRating(0);
      setCurrentComment("");
      
      if (currentDimIndex < dimensions.length - 1) {
        setCurrentDimIndex(prev => prev + 1);
      } else {
        submitFeedback.mutate();
      }
    }
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-[#4A7C7C]/20 rounded-full flex items-center justify-center">
          <Heart className="w-10 h-10 text-[#4A7C7C]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Share Your Feedback</h1>
        <p className="text-gray-600">
          Someone you know is seeking to grow and has asked for your honest perspective.
        </p>
      </div>

      <Card className="bg-[#FAF8F5] border-[#4A7C7C]/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#4A7C7C] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-800">Your feedback is anonymous</h3>
              <p className="text-sm text-gray-600">
                Your responses will be combined with others. The person will see average 
                scores and themes, but not who said what.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#4A7C7C]/10 to-[#7C9A8E]/10 border-[#4A7C7C]/20">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#D4A574]" />
            What to expect
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#4A7C7C] mt-1">•</span>
              <span>You'll rate {dimensions.length} areas on a 1-5 scale</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4A7C7C] mt-1">•</span>
              <span>Optional comments to share specific observations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4A7C7C] mt-1">•</span>
              <span>Takes about 3-5 minutes</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-[#4A7C7C] hover:bg-[#3A6C6C] text-white py-6 text-lg"
        onClick={() => setStep("questions")}
        data-testid="button-start-feedback"
      >
        Begin Feedback
      </Button>
    </motion.div>
  );

  const renderQuestions = () => {
    const dimKey = dimensions[currentDimIndex];
    const dimension = DIMENSIONS[dimKey];
    const progress = ((currentDimIndex + 1) / dimensions.length) * 100;

    return (
      <motion.div
        key={currentDimIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Question {currentDimIndex + 1} of {dimensions.length}</span>
            <span className="text-[#4A7C7C] font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-[#4A7C7C]/20">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-800">{dimension?.label || dimKey}</h2>
              <p className="text-gray-600">
                {dimension?.questions[0] || `How would you rate their ${dimKey}?`}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setCurrentRating(rating)}
                  className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${
                    currentRating >= rating 
                      ? 'bg-[#4A7C7C] border-[#4A7C7C] text-white' 
                      : 'border-gray-300 hover:border-[#4A7C7C]/50'
                  }`}
                  data-testid={`button-rating-${rating}`}
                >
                  <Star className={`w-5 h-5 ${currentRating >= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>Needs work</span>
              <span>Excellent</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Any specific observations? (optional)
              </label>
              <Textarea
                placeholder="Share examples or specific feedback..."
                value={currentComment}
                onChange={(e) => setCurrentComment(e.target.value)}
                className="border-[#4A7C7C]/30 min-h-[80px]"
                data-testid="input-comment"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-[#4A7C7C] hover:bg-[#3A6C6C] text-white py-6"
          onClick={handleNext}
          disabled={currentRating === 0 || submitFeedback.isPending}
          data-testid="button-next"
        >
          {submitFeedback.isPending ? "Submitting..." : 
           currentDimIndex === dimensions.length - 1 ? (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Feedback
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    );
  };

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 text-center py-12"
    >
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Thank You!</h1>
      <p className="text-gray-600 max-w-sm mx-auto">
        Your feedback has been submitted anonymously. Your honest perspective 
        will help this person grow and develop.
      </p>
      <Card className="bg-gradient-to-br from-[#4A7C7C]/10 to-[#7C9A8E]/10 border-[#4A7C7C]/20">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 italic">
            "As iron sharpens iron, so one person sharpens another." — Proverbs 27:17
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Initial load shows intro
  if (step === "loading" && data) {
    setTimeout(() => setStep("intro"), 100);
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {step === "intro" && renderIntro()}
        {step === "questions" && renderQuestions()}
        {step === "complete" && renderComplete()}
      </div>
    </div>
  );
}
