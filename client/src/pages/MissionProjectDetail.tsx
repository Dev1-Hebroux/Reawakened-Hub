import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  ChevronLeft,
  MapPin,
  Users,
  Heart,
  Share2,
  Globe,
  BookOpen,
  MessageCircle,
  Check,
  Target
} from "lucide-react";

const projectsData: Record<number, {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  location: string;
  impactGoal: number;
  impactCurrent: number;
  impactLabel: string;
  howToHelp: string[];
  prayerPoints: string[];
  updates: { date: string; text: string }[];
}> = {
  1: {
    id: 1,
    title: "Digital Bible Courses And Physical Bible Distribution",
    description: "Target 5,000 by 2030",
    longDescription: "We're partnering with local churches and schools across East Africa to distribute digital Bible courses and physical Bibles. Many young people in rural areas have smartphones but limited access to Scripture in their heart language. This project bridges that gap by providing free Bible apps, audio Bibles, physical Bibles, and discipleship resources.",
    location: "East Africa",
    impactGoal: 5000,
    impactCurrent: 0,
    impactLabel: "reached by 2030",
    howToHelp: [
      "Pray for the young people receiving Scripture",
      "Share this project with your church or small group",
      "Volunteer as a digital prayer partner",
      "Help translate discipleship content"
    ],
    prayerPoints: [
      "Pray for hearts to be open to receiving God's Word",
      "Pray for the local church leaders distributing the content",
      "Pray for lasting spiritual transformation in these communities"
    ],
    updates: [
      { date: "Dec 2025", text: "Reached 5,000 youth milestone in Kenya!" },
      { date: "Nov 2025", text: "New audio Bible app launched in Swahili" },
      { date: "Oct 2025", text: "Partnership with 15 new schools established" }
    ]
  },
  2: {
    id: 2,
    title: "Youth Discipleship Network",
    description: "Training 500 young leaders",
    longDescription: "The Youth Discipleship Network is building a movement of young Christian leaders across Southeast Asia. Through weekly online training sessions, mentorship partnerships, and in-person gatherings, we're equipping the next generation to lead their churches, campuses, and communities with boldness and wisdom.",
    location: "Southeast Asia",
    impactGoal: 500,
    impactCurrent: 10,
    impactLabel: "leaders trained",
    howToHelp: [
      "Become a virtual mentor for a young leader",
      "Pray for the leaders in training",
      "Share leadership resources and curriculum",
      "Connect us with churches in your network"
    ],
    prayerPoints: [
      "Pray for wisdom and perseverance for each leader",
      "Pray for protection over these young believers",
      "Pray for multiplication as they train others"
    ],
    updates: [
      { date: "Dec 2025", text: "First cohort of 50 leaders graduated!" },
      { date: "Nov 2025", text: "Expanded to Philippines and Indonesia" },
      { date: "Oct 2025", text: "Leadership summit hosted 200 attendees" }
    ]
  },
  3: {
    id: 3,
    title: "Campus Revival Movement",
    description: "Prayer and evangelism on 50 campuses",
    longDescription: "University campuses are strategic mission fields where the next generation's worldview is shaped. Our Campus Revival Movement is establishing prayer groups and evangelism teams on campuses across the UK, US, Brazil, Africa, Asia, Australia, and Europe. Students are leading weekly prayer meetings, hosting faith discussions, and sharing the gospel with their peers.",
    location: "Global",
    impactGoal: 50,
    impactCurrent: 1,
    impactLabel: "campuses active",
    howToHelp: [
      "Pray for student leaders on campuses worldwide",
      "Connect us with students you know anywhere in the world",
      "Share evangelism training resources",
      "Join our monthly prayer call for campuses"
    ],
    prayerPoints: [
      "Pray for boldness for students sharing their faith",
      "Pray for revival to break out on university campuses globally",
      "Pray for the salvation of skeptical students"
    ],
    updates: [
      { date: "Dec 2025", text: "New campus groups started in Germany and France" },
      { date: "Nov 2025", text: "Campus prayer week saw 300+ students engaged" },
      { date: "Oct 2025", text: "Partnership with 5 campus ministries established" }
    ]
  }
};

export function MissionProjectDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isPraying, setIsPraying] = useState(false);

  const projectId = parseInt(id || "1");
  const project = projectsData[projectId] || projectsData[1];

  const handlePray = () => {
    setIsPraying(true);
    toast.success("Thank you for praying! Your prayers make a difference.");
    setTimeout(() => setIsPraying(false), 3000);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const text = `Check out this mission project: ${project.title}`;
    
    if (navigator.share) {
      navigator.share({ title: project.title, text, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/90">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-lg mx-auto">
          
          <button 
            onClick={() => navigate("/missions")}
            className="flex items-center gap-2 text-[#D4A574] hover:text-white mb-6 transition-colors font-medium"
            data-testid="button-back-missions"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Missions
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-r from-primary/30 to-[#4A7C7C]/20 rounded-3xl p-6 mb-6 border border-white/10">
              <span className="inline-block bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full mb-3">
                Digital Mission
              </span>
              <h1 className="text-2xl font-display font-bold text-white mb-2">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                <MapPin className="h-4 w-4" />
                {project.location}
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Impact Progress</span>
                  <span className="text-sm font-bold text-primary">
                    {project.impactCurrent.toLocaleString()} / {project.impactGoal.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/10 rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${(project.impactCurrent / project.impactGoal) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-white/50 mt-2 text-center">{project.impactLabel}</p>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
                  onClick={handlePray}
                  disabled={isPraying}
                  data-testid="button-pray"
                >
                  {isPraying ? <Check className="h-4 w-4 mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
                  {isPraying ? "Praying!" : "Pray Now"}
                </Button>
                <Button 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleShare}
                  data-testid="button-share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10">
              <h2 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                About This Project
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                {project.longDescription}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10">
              <h2 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-[#D4A574]" />
                How You Can Help
              </h2>
              <ul className="space-y-2">
                {project.howToHelp.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/10">
              <h2 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                Prayer Points
              </h2>
              <ul className="space-y-2">
                {project.prayerPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                    <span className="text-primary">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <h2 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#7C9A8E]" />
                Recent Updates
              </h2>
              <div className="space-y-3">
                {project.updates.map((update, i) => (
                  <div key={i} className="border-l-2 border-primary/50 pl-3">
                    <p className="text-xs text-white/40 mb-1">{update.date}</p>
                    <p className="text-white/70 text-sm">{update.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
