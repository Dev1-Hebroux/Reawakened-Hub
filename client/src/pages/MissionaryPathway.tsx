import { motion } from "framer-motion";
import { 
  Flame, Users, BookOpen, Home, Share2, ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

interface PathwayStage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Flame;
  color: string;
  practices: string[];
  nextStep: string;
}

const pathwayStages: PathwayStage[] = [
  {
    id: "prayer",
    number: 1,
    title: "Extraordinary Prayer",
    subtitle: "The Foundation of Movement",
    description: "A prayer movement precedes every Gospel movement. Learn to pray with urgency and faith for the lost, for workers, and for breakthrough in your networks.",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    practices: [
      "Daily prayer for the lost in your network",
      "Weekly prayer walks in your neighborhood",
      "Fasting for breakthrough",
      "Praying Scripture over people and places"
    ],
    nextStep: "Start a daily 10-minute prayer rhythm for 3 people who don't know Jesus"
  },
  {
    id: "missionary",
    number: 2,
    title: "Live as Missionaries",
    subtitle: "Sent Ones in Everyday Life",
    description: "Embrace your identity as a sent one. Live intentionally among those far from God, building genuine relationships and creating space for spiritual conversations.",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    practices: [
      "Identify your 'person of peace' in your network",
      "Practice hospitality and generosity",
      "Share meals with non-believers regularly",
      "Listen for needs and respond with care"
    ],
    nextStep: "List 5 people in your life who don't know Jesus and pray for them daily"
  },
  {
    id: "dbs",
    number: 3,
    title: "Plant the Gospel",
    subtitle: "Discovery Bible Study",
    description: "Use Discovery Bible Study (DBS) as the primary tool for disciple-making. It's simple, reproducible, and transforms people from the ground up.",
    icon: BookOpen,
    color: "from-green-500 to-emerald-500",
    practices: [
      "Learn the DBS method: Read, Retell, Discover, Obey, Share",
      "Start a DBS with interested seekers",
      "Focus on obedience-based learning",
      "Multiply by training new DBS leaders"
    ],
    nextStep: "Invite 2-3 spiritually curious people to explore the Bible with you using DBS"
  },
  {
    id: "microchurch",
    number: 4,
    title: "Microchurch Emerges",
    subtitle: "Spiritual Family on Mission",
    description: "As disciples mature and multiply, a microchurch naturally forms—an extended spiritual family, led by ordinary people, living in everyday Gospel community.",
    icon: Home,
    color: "from-purple-500 to-pink-500",
    practices: [
      "Gather regularly for fellowship, teaching, breaking bread, and prayer",
      "Practice the 'one anothers' of Scripture",
      "Care for one another's practical needs",
      "Own the mission together in your network"
    ],
    nextStep: "Identify the core group forming and commit to weekly gatherings"
  },
  {
    id: "multiplication",
    number: 5,
    title: "Multiplication",
    subtitle: "Movements That Spread",
    description: "The goal is not just one church, but a movement. Train leaders, send out teams, and see disciples making disciples and churches birthing churches.",
    icon: Share2,
    color: "from-yellow-500 to-orange-500",
    practices: [
      "Identify and train potential leaders",
      "Send leaders to start new DBS groups",
      "Celebrate and share stories of multiplication",
      "Connect with other microchurches in the network"
    ],
    nextStep: "Mentor one person to lead their own DBS and microchurch"
  }
];

export function MissionaryPathway() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#0d1e36] text-white overflow-x-hidden">
      <Navbar />
      
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Movement Training</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
              The Missionary Pathway
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              A journey from personal prayer to movement multiplication. Every disciple-making movement follows this pattern—from the book of Acts to today's global movements.
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                5 Stages
              </span>
              <span className="text-gray-600">|</span>
              <span>Reverse-engineered from global movements</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-green-500 to-purple-500 hidden md:block" />
            
            <div className="space-y-8">
              {pathwayStages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                    data-testid={`card-stage-${stage.id}`}
                  >
                    <div className="md:ml-20">
                      <div className={`absolute left-4 md:left-4 w-8 h-8 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-white font-bold text-sm z-10`}>
                        {stage.number}
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                        <div className="flex items-start gap-4">
                          <div className={`hidden md:flex flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${stage.color} items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500 uppercase tracking-wider">Stage {stage.number}</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-1">
                              {stage.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-3">{stage.subtitle}</p>
                            
                            <p className="text-gray-300 mb-4">
                              {stage.description}
                            </p>
                            
                            <div className="bg-white/5 rounded-xl p-4 mb-4">
                              <h4 className="text-sm font-bold text-white mb-2">Key Practices:</h4>
                              <ul className="space-y-2">
                                {stage.practices.map((practice, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    {practice}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className={`bg-gradient-to-r ${stage.color} bg-opacity-10 rounded-lg p-3 border border-white/10`}>
                              <p className="text-sm">
                                <span className="font-bold text-white">Next Step: </span>
                                <span className="text-gray-300">{stage.nextStep}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-2xl p-8 text-center"
          >
            <h2 className="text-2xl font-display font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Join one of our cohorts to walk the Missionary Pathway with others. You'll get training, mentoring, and a community to grow with.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/journeys">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  data-testid="button-browse-cohorts"
                >
                  Browse Cohorts
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/community">
                <Button variant="outline" size="lg" data-testid="button-join-community">
                  Join the Community
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default MissionaryPathway;
