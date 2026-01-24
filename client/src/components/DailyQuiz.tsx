import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/useAuth";

type AudienceSegment = 'gen-z-student' | 'young-professional' | 'couple' | 'parent' | 'senior' | 'general';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audienceSegments: AudienceSegment[];
  weekTheme?: number; // 1-5 for DOMINION weeks
  difficulty?: 'easy' | 'medium' | 'hard';
}

const sampleQuestions: QuizQuestion[] = [
  // Week 1: Identity & Belonging
  {
    id: 1,
    question: "What does DOMINION mean in the context of this campaign?",
    options: [
      "Having power over others",
      "Stepping into your God-given authority and purpose",
      "A type of prayer",
      "A historical event"
    ],
    correctIndex: 1,
    explanation: "DOMINION is about understanding your identity in Christ and stepping into the authority and purpose God has given you.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    weekTheme: 1,
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "According to scripture, where does your true identity come from?",
    options: [
      "Your achievements and success",
      "What others think of you",
      "Being created in God's image",
      "Your social media following"
    ],
    correctIndex: 2,
    explanation: "Genesis 1:27 tells us we are created in God's image. Your identity is rooted in whose you are, not what you do.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'senior'],
    weekTheme: 1,
    difficulty: 'medium'
  },
  {
    id: 3,
    question: "How can you find belonging in uncertain times?",
    options: [
      "Isolate yourself from others",
      "Root your identity in your work or relationships",
      "Remember you belong to God and His family",
      "Focus only on fixing yourself"
    ],
    correctIndex: 2,
    explanation: "True belonging comes from being part of God's family. Even when everything else shifts, you belong to Him and His community.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple'],
    weekTheme: 1,
    difficulty: 'medium'
  },

  // Week 2: Prayer & Presence
  {
    id: 4,
    question: "What is the first step in deeper reflection?",
    options: [
      "Rushing through content",
      "Pausing and being present",
      "Skipping to the action",
      "Sharing immediately"
    ],
    correctIndex: 1,
    explanation: "True reflection starts with pausing and being fully present. This allows you to hear what God might be saying to you.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    weekTheme: 2,
    difficulty: 'easy'
  },
  {
    id: 5,
    question: "Why is creating phone-free time important for spiritual growth?",
    options: [
      "Phones are inherently evil",
      "To punish yourself",
      "To create space for God's voice without distractions",
      "Because everyone else is doing it"
    ],
    correctIndex: 2,
    explanation: "Constant notifications and distractions make it hard to hear God. Creating space helps you be present with Him.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional'],
    weekTheme: 2,
    difficulty: 'medium'
  },
  {
    id: 6,
    question: "What does 'practicing God's presence' mean?",
    options: [
      "Only praying at church",
      "Being aware of God with you throughout your day",
      "Ignoring your daily responsibilities",
      "Feeling guilty all the time"
    ],
    correctIndex: 1,
    explanation: "Practicing God's presence means cultivating awareness that God is with you in every moment—not just in 'spiritual' activities.",
    audienceSegments: ['general', 'young-professional', 'parent', 'senior'],
    weekTheme: 2,
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "How long should you pray each day?",
    options: [
      "Exactly 1 hour or it doesn't count",
      "Whatever feels authentic to you—start with what's sustainable",
      "You only need to pray on Sundays",
      "As little as possible"
    ],
    correctIndex: 1,
    explanation: "God values authenticity over duration. Start with what's sustainable for you, even if it's just 5 minutes. Consistency matters more than length.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'parent'],
    weekTheme: 2,
    difficulty: 'easy'
  },

  // Week 3: Peace & Anxiety
  {
    id: 8,
    question: "What is the 5-4-3-2-1 grounding technique?",
    options: [
      "A countdown to launch a rocket",
      "Identifying 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste",
      "A prayer you say 5 times a day",
      "A Bible reading plan"
    ],
    correctIndex: 1,
    explanation: "The 5-4-3-2-1 technique helps you ground yourself in the present moment when anxiety hits, using your five senses to reconnect with reality.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent'],
    weekTheme: 3,
    difficulty: 'easy'
  },
  {
    id: 9,
    question: "What does Philippians 4:6-7 teach about anxiety?",
    options: [
      "Never feel anxious or you're failing",
      "Bring your anxieties to God in prayer, and He will give you peace",
      "Ignore your anxiety and pretend everything is fine",
      "Anxiety is a sin you must confess"
    ],
    correctIndex: 1,
    explanation: "Philippians 4:6-7 doesn't condemn anxiety—it invites us to bring it to God through prayer and thanksgiving, promising His peace in return.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    weekTheme: 3,
    difficulty: 'medium'
  },
  {
    id: 10,
    question: "How can you find peace in the midst of chaos?",
    options: [
      "Eliminate all sources of stress immediately",
      "Pretend the chaos doesn't exist",
      "Practice presence, prayer, and remembering God's promises",
      "Work harder until you achieve perfect control"
    ],
    correctIndex: 2,
    explanation: "Peace isn't the absence of chaos—it's God's presence in the middle of it. We find peace through grounding practices and trusting God's promises.",
    audienceSegments: ['general', 'young-professional', 'couple', 'parent', 'senior'],
    weekTheme: 3,
    difficulty: 'medium'
  },
  {
    id: 11,
    question: "What role does community play in managing anxiety?",
    options: [
      "Community should be avoided when you're anxious",
      "Sharing your struggles with trusted friends brings support and perspective",
      "You should only share when you're doing well",
      "Community creates more anxiety"
    ],
    correctIndex: 1,
    explanation: "We're not meant to face anxiety alone. Trusted community provides support, prayer, perspective, and reminds us we're not the only ones struggling.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple'],
    weekTheme: 3,
    difficulty: 'medium'
  },

  // Week 4: Bold Witness
  {
    id: 12,
    question: "What does it mean to be a 'bold witness'?",
    options: [
      "Arguing with everyone about religion",
      "Forcing your beliefs on others",
      "Courageously sharing your faith story and living authentically",
      "Being loud and confrontational"
    ],
    correctIndex: 2,
    explanation: "Being a bold witness means having the courage to share your story authentically, not forcing beliefs but inviting others to see how God has worked in your life.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    weekTheme: 4,
    difficulty: 'easy'
  },
  {
    id: 13,
    question: "Why might it be scary to share your faith with friends?",
    options: [
      "Fear of judgment or rejection",
      "Because faith should be kept private",
      "There's no reason to be scared",
      "Sharing faith is wrong"
    ],
    correctIndex: 0,
    explanation: "Fear of judgment or rejection is natural. But remember, you're not responsible for their response—just for being faithful to share your story.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple'],
    weekTheme: 4,
    difficulty: 'easy'
  },
  {
    id: 14,
    question: "What's a simple first step to being a witness?",
    options: [
      "Memorize the entire Bible",
      "Share one spark or insight that impacted you with a friend",
      "Become a pastor",
      "Wait until you're perfect"
    ],
    correctIndex: 1,
    explanation: "You don't need to be a Bible scholar to be a witness. Start small—share what's impacted you. Your story has power.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent'],
    weekTheme: 4,
    difficulty: 'easy'
  },

  // Week 5: Commission
  {
    id: 15,
    question: "What does it mean to be 'commissioned' by God?",
    options: [
      "Only pastors are commissioned",
      "Everyone who follows Jesus is called to make a difference",
      "It's an ancient term that doesn't apply today",
      "You need special training to be commissioned"
    ],
    correctIndex: 1,
    explanation: "The Great Commission applies to all followers of Jesus. You don't need a title or degree—God has already equipped you to make an impact.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    weekTheme: 5,
    difficulty: 'easy'
  },
  {
    id: 16,
    question: "How can you continue growing after DOMINION ends?",
    options: [
      "Stop all spiritual practices",
      "Only focus on what you already know",
      "Commit to one specific habit like daily sparks, prayer, or community",
      "Wait for the next campaign"
    ],
    correctIndex: 2,
    explanation: "Sustainable growth comes from choosing one habit you can stick with. Whether it's daily sparks, prayer, or community—consistency beats intensity.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    weekTheme: 5,
    difficulty: 'medium'
  },

  // General Application Questions
  {
    id: 17,
    question: "Why is community important in spiritual growth?",
    options: [
      "It's not important",
      "For social media followers",
      "We grow stronger together and can encourage one another",
      "To compete with others"
    ],
    correctIndex: 2,
    explanation: "The Bible teaches us that we are stronger together. Community provides encouragement, accountability, and shared wisdom.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    difficulty: 'easy'
  },
  {
    id: 18,
    question: "What makes a spark truly impactful?",
    options: [
      "Reading it quickly",
      "Applying it to your daily life",
      "Forgetting it after",
      "Only reading the quote"
    ],
    correctIndex: 1,
    explanation: "A spark becomes impactful when you move from reading to action. Applying the insights to your daily life creates lasting change.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    difficulty: 'easy'
  },
  {
    id: 19,
    question: "What is the purpose of the 'Take Action' prompt?",
    options: [
      "Just for decoration",
      "To give you a practical step to apply what you've learned",
      "To fill space",
      "For entertainment only"
    ],
    correctIndex: 1,
    explanation: "The 'Take Action' prompt gives you a concrete, practical step to apply the day's insight. Action is where transformation happens.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    difficulty: 'easy'
  },

  // Gen Z Specific
  {
    id: 20,
    question: "How can you balance social media with spiritual health?",
    options: [
      "Delete all social media immediately",
      "Scroll mindlessly whenever you're bored",
      "Set intentional boundaries and create phone-free time for God",
      "Post everything about your faith online"
    ],
    correctIndex: 2,
    explanation: "Social media isn't inherently bad, but it needs boundaries. Creating intentional phone-free time helps protect your mental and spiritual health.",
    audienceSegments: ['gen-z-student', 'young-professional'],
    difficulty: 'medium'
  },
  {
    id: 21,
    question: "What's a healthy way to handle faith questions and doubts?",
    options: [
      "Suppress them and pretend you have it all figured out",
      "Abandon your faith entirely",
      "Bring them to trusted mentors and community; doubt can lead to deeper faith",
      "Keep them secret forever"
    ],
    correctIndex: 2,
    explanation: "Doubt is a normal part of faith development. Bringing questions to community and mentors can actually strengthen your faith rather than weaken it.",
    audienceSegments: ['gen-z-student', 'young-professional'],
    difficulty: 'medium'
  },
  {
    id: 22,
    question: "How can your faith be authentic in a skeptical world?",
    options: [
      "Hide your faith completely",
      "Aggressively defend every belief",
      "Live authentically, share your story, and listen to others",
      "Only talk about faith with other Christians"
    ],
    correctIndex: 2,
    explanation: "Authenticity is magnetic. Share your real story—struggles and all. Listen to others. Your genuine journey is more compelling than perfect answers.",
    audienceSegments: ['gen-z-student', 'young-professional'],
    difficulty: 'medium'
  },

  // Young Professional Specific
  {
    id: 23,
    question: "How can you prioritize faith when your schedule is packed?",
    options: [
      "Wait until your career settles down",
      "Choose one small sustainable practice like a 5-minute morning devotional",
      "Quit your job to focus on faith",
      "Only engage spiritually on weekends"
    ],
    correctIndex: 1,
    explanation: "You don't need hours each day. Start with a sustainable micro-habit like a 5-minute devotional. Small consistent steps compound over time.",
    audienceSegments: ['young-professional', 'parent'],
    difficulty: 'medium'
  },
  {
    id: 24,
    question: "How does your work relate to your faith?",
    options: [
      "Work and faith are completely separate",
      "Only ministry jobs count as 'sacred work'",
      "All work can be an act of worship and service when done with integrity",
      "You should only work at Christian companies"
    ],
    correctIndex: 2,
    explanation: "Colossians 3:23 teaches us to work as if working for the Lord. Every job—when done with integrity and purpose—can honor God and serve others.",
    audienceSegments: ['young-professional', 'parent'],
    difficulty: 'medium'
  },

  // Couple Specific
  {
    id: 25,
    question: "How can you grow spiritually as a couple?",
    options: [
      "Compete to see who's more spiritual",
      "Keep your faith completely separate",
      "Pray together, share what you're learning, and encourage each other",
      "One person should lead entirely while the other follows"
    ],
    correctIndex: 2,
    explanation: "Spiritual intimacy strengthens relationships. Praying together, sharing insights, and encouraging each other's growth builds connection and depth.",
    audienceSegments: ['couple'],
    difficulty: 'medium'
  },
  {
    id: 26,
    question: "What if you and your partner are at different places spiritually?",
    options: [
      "Give up on growing together",
      "Force your partner to catch up",
      "Respect each other's journey and create space for both to grow",
      "Ignore the difference"
    ],
    correctIndex: 2,
    explanation: "Different spiritual paces are normal. Honor each other's journey, share without pressure, and create space for both to grow authentically.",
    audienceSegments: ['couple'],
    difficulty: 'medium'
  },

  // Parent Specific
  {
    id: 27,
    question: "How can you model faith for your kids when you don't have it all figured out?",
    options: [
      "Pretend you're perfect",
      "Hide your struggles from them",
      "Be authentic about your journey—kids learn more from honesty than perfection",
      "Wait until you're perfect to talk about faith"
    ],
    correctIndex: 2,
    explanation: "Kids don't need perfect parents—they need authentic ones. Your honest journey (including struggles) teaches them faith is real and messy and beautiful.",
    audienceSegments: ['parent'],
    difficulty: 'medium'
  },
  {
    id: 28,
    question: "What's a simple way to incorporate faith into family life?",
    options: [
      "Force hour-long Bible studies every night",
      "Expect kids to figure it out on their own",
      "Share gratitude at dinner, pray together, or talk about what you're learning",
      "Only talk about faith at church"
    ],
    correctIndex: 2,
    explanation: "Simple, sustainable practices work best: gratitude at meals, bedtime prayers, or sharing one thing you learned. Make it conversational, not forced.",
    audienceSegments: ['parent'],
    difficulty: 'easy'
  },

  // Senior Specific
  {
    id: 29,
    question: "How can you pass on wisdom to the next generation?",
    options: [
      "Keep your experiences to yourself",
      "Wait for younger people to ask (they probably won't)",
      "Intentionally share your story and offer to mentor when appropriate",
      "Assume younger generations aren't interested"
    ],
    correctIndex: 2,
    explanation: "Your life experience is valuable. Younger generations crave wisdom—share your story, offer mentorship, and pass on what you've learned.",
    audienceSegments: ['senior'],
    difficulty: 'medium'
  },
  {
    id: 30,
    question: "What role does reflection play in deepening faith over time?",
    options: [
      "Reflection is only for beginners",
      "Looking back is a waste of time",
      "Reflecting on God's faithfulness strengthens trust for the future",
      "You should only focus on the present"
    ],
    correctIndex: 2,
    explanation: "Reflection builds perspective. Looking back at how God has been faithful in your life deepens trust and gives you wisdom to share.",
    audienceSegments: ['senior', 'parent'],
    difficulty: 'medium'
  },

  // Additional General Questions
  {
    id: 31,
    question: "What's the difference between reading Scripture and meditating on it?",
    options: [
      "There is no difference",
      "Reading is quick; meditating is sitting with it, letting it sink deep",
      "Meditation is only for advanced Christians",
      "Reading is better than meditating"
    ],
    correctIndex: 1,
    explanation: "Reading gives information; meditation transforms. When you sit with a verse, repeat it, and ask God to speak through it, it moves from head to heart.",
    audienceSegments: ['general', 'young-professional', 'parent', 'senior'],
    difficulty: 'medium'
  },
  {
    id: 32,
    question: "How should you respond when prayer doesn't seem to 'work'?",
    options: [
      "Give up on prayer entirely",
      "Assume God isn't listening",
      "Keep praying and trust God's timing, even when you don't see immediate results",
      "Only pray for things you're sure will happen"
    ],
    correctIndex: 2,
    explanation: "Prayer isn't a vending machine. Sometimes the answer is 'wait,' sometimes 'no,' sometimes 'yes'—but God always hears and cares. Keep praying.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    difficulty: 'medium'
  },
  {
    id: 33,
    question: "What does it mean to 'abide' in Christ?",
    options: [
      "Go to church every Sunday",
      "Stay connected to Jesus like a branch to a vine—drawing life from Him daily",
      "Follow all religious rules perfectly",
      "Isolate yourself from the world"
    ],
    correctIndex: 1,
    explanation: "John 15 describes abiding like a branch connected to a vine. You stay connected to Jesus daily through prayer, Scripture, and presence—drawing life from Him.",
    audienceSegments: ['general', 'young-professional', 'couple', 'senior'],
    difficulty: 'medium'
  },
  {
    id: 34,
    question: "How can you hear God's voice in your daily life?",
    options: [
      "You can't—God doesn't speak anymore",
      "Only prophets hear God",
      "Through Scripture, prayer, wise counsel, and the Holy Spirit's gentle promptings",
      "Wait for audible voices"
    ],
    correctIndex: 2,
    explanation: "God speaks through many ways: Scripture, prayer, community, creation, and the Holy Spirit's gentle nudges. Learning to recognize His voice takes practice and presence.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    difficulty: 'medium'
  },
  {
    id: 35,
    question: "What's the relationship between faith and action?",
    options: [
      "Faith is all you need; action doesn't matter",
      "Action is all that matters; faith is optional",
      "Faith without action is dead—real faith produces action",
      "They're completely unrelated"
    ],
    correctIndex: 2,
    explanation: "James 2:17 says faith without works is dead. Genuine faith naturally produces action. If you truly believe something, it changes how you live.",
    audienceSegments: ['general', 'gen-z-student', 'young-professional', 'couple', 'parent', 'senior'],
    difficulty: 'easy'
  },
  {
    id: 36,
    question: "How do you deal with spiritual burnout?",
    options: [
      "Push through and try harder",
      "Quit all spiritual practices",
      "Rest, reassess your pace, and focus on relationship over performance",
      "Pretend it's not happening"
    ],
    correctIndex: 2,
    explanation: "Burnout often comes from treating faith like a to-do list. God invites you to rest and reconnect with relationship over performance. Take a break and reset.",
    audienceSegments: ['general', 'young-professional', 'parent'],
    difficulty: 'medium'
  },
];

function getCurrentWeek(): number {
  const campaignStart = new Date('2026-01-19T00:00:00Z');
  const campaignEnd = new Date('2026-02-17T23:59:59Z');
  const now = new Date();

  if (now < campaignStart) return 1;
  if (now > campaignEnd) return 5;

  const daysSinceStart = Math.floor((now.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(5, Math.floor(daysSinceStart / 6) + 1);
}

function filterQuestions(
  questions: QuizQuestion[],
  audienceSegment: AudienceSegment | null,
  currentWeek: number
): QuizQuestion[] {
  const segment = audienceSegment || 'general';

  // Filter by audience segment
  const audienceFiltered = questions.filter(q =>
    q.audienceSegments.includes(segment) || q.audienceSegments.includes('general')
  );

  // Prioritize current week's theme
  const weekQuestions = audienceFiltered.filter(q => q.weekTheme === currentWeek);
  const otherQuestions = audienceFiltered.filter(q => !q.weekTheme || q.weekTheme !== currentWeek);

  // Take 2 from current week, 1 from other topics (or adjust if not enough week questions)
  const shuffledWeek = [...weekQuestions].sort(() => Math.random() - 0.5);
  const shuffledOther = [...otherQuestions].sort(() => Math.random() - 0.5);

  const selected: QuizQuestion[] = [];
  selected.push(...shuffledWeek.slice(0, 2));
  selected.push(...shuffledOther.slice(0, 3 - selected.length));

  // If we still don't have 3, take any available
  if (selected.length < 3) {
    const remaining = audienceFiltered.filter(q => !selected.includes(q));
    selected.push(...remaining.slice(0, 3 - selected.length));
  }

  return selected;
}

export function DailyQuiz() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [todaysQuestions, setTodaysQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    const currentWeek = getCurrentWeek();
    const audienceSegment = user?.audienceSegment as AudienceSegment | null;
    const filtered = filterQuestions(sampleQuestions, audienceSegment, currentWeek);
    setTodaysQuestions(filtered);
  }, [user]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === todaysQuestions[currentQuestion].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < todaysQuestions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
      if (score >= 2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const resetQuiz = () => {
    const currentWeek = getCurrentWeek();
    const audienceSegment = user?.audienceSegment as AudienceSegment | null;
    const filtered = filterQuestions(sampleQuestions, audienceSegment, currentWeek);
    setTodaysQuestions(filtered);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl p-5 border flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
        style={{ backgroundColor: 'rgba(74, 124, 124, 0.08)', borderColor: 'rgba(74, 124, 124, 0.2)' }}
        data-testid="button-start-quiz"
      >
        <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 124, 124, 0.15)' }}>
          <Brain className="h-6 w-6" style={{ color: '#4A7C7C' }} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white">Daily Knowledge Check</h4>
          <p className="text-sm text-white/60">Test what you've learned in a fun way</p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/40" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'rgba(74, 124, 124, 0.12)', borderColor: 'rgba(74, 124, 124, 0.25)' }}
    >
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 124, 124, 0.15)' }}>
            <Brain className="h-5 w-5" style={{ color: '#4A7C7C' }} />
          </div>
          <div>
            <h4 className="font-bold text-white">Daily Quiz</h4>
            <p className="text-sm text-white/60">Question {currentQuestion + 1} of {todaysQuestions.length}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/40 hover:text-white/60 text-sm"
        >
          Close
        </button>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex gap-1 mb-4">
                {todaysQuestions.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: i < currentQuestion ? '#7C9A8E' : i === currentQuestion ? '#4A7C7C' : 'rgba(255,255,255,0.1)'
                    }}
                  />
                ))}
              </div>

              <p className="text-lg font-medium text-white mb-6" data-testid="text-quiz-question">
                {todaysQuestions[currentQuestion]?.question}
              </p>

              <div className="space-y-3">
                {todaysQuestions[currentQuestion]?.options.map((option, i) => {
                  const isCorrect = i === todaysQuestions[currentQuestion].correctIndex;
                  const isSelected = selectedAnswer === i;
                  
                  let bgColor = 'rgba(250, 248, 245, 0.05)';
                  let borderColor = 'rgba(250, 248, 245, 0.1)';
                  
                  if (showResult) {
                    if (isCorrect) {
                      bgColor = 'rgba(124, 154, 142, 0.2)';
                      borderColor = 'rgba(124, 154, 142, 0.4)';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'rgba(239, 68, 68, 0.1)';
                      borderColor = 'rgba(239, 68, 68, 0.3)';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={showResult}
                      className="w-full p-4 rounded-xl text-left transition-all flex items-center gap-3"
                      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
                      data-testid={`button-answer-${i}`}
                    >
                      <div className="flex-1 text-white/90">{option}</div>
                      {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-[#7C9A8E]" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400" />}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(250, 248, 245, 0.05)' }}>
                    <p className="text-sm text-white/70">{todaysQuestions[currentQuestion].explanation}</p>
                  </div>
                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-[#4A7C7C] to-[#3A6666] hover:from-[#3A6666] hover:to-[#2A5656]"
                    data-testid="button-next-question"
                  >
                    {currentQuestion < todaysQuestions.length - 1 ? "Next Question" : "See Results"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="mb-4">
                <Trophy className="h-16 w-16 mx-auto" style={{ color: score >= 2 ? '#D4A574' : '#7C9A8E' }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2" data-testid="text-quiz-score">
                {score} / {todaysQuestions.length}
              </h3>
              <p className="text-white/60 mb-6">
                {score === todaysQuestions.length
                  ? "Perfect score! You're crushing it!"
                  : score >= 2
                  ? "Great job! Keep learning!"
                  : "Good effort! Try again tomorrow!"}
              </p>
              <Button
                onClick={resetQuiz}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                data-testid="button-retry-quiz"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
