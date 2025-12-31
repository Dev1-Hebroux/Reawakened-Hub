import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { DigitalActionsModal } from "@/components/ui/DigitalActionsModal";
import { 
  Heart, 
  HandHeart, 
  Globe, 
  Share2, 
  Users, 
  MapPin, 
  Clock, 
  Target, 
  CheckCircle2, 
  Play,
  MessageCircle,
  ArrowLeft,
  Flame,
  ExternalLink
} from "lucide-react";

type ActionType = 'share' | 'invite' | 'live-room' | 'training' | 'follow-up';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [modalAction, setModalAction] = useState<ActionType | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['/api/mission/projects', id],
    queryFn: async () => {
      const res = await fetch(`/api/mission/projects/${id}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="pt-32 pb-20 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/missions')} data-testid="button-back-missions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Missions
          </Button>
        </div>
        <MobileNav />
      </div>
    );
  }

  const fundingPercent = project.fundingGoal 
    ? Math.min(100, Math.round((project.fundsRaised || 0) / project.fundingGoal * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-foreground pb-20 md:pb-0">
      <Navbar />
      
      <section className="relative min-h-[50vh] flex items-end pt-24 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#1a2744]/80" />
        {project.imageUrl && (
          <div className="absolute inset-0 opacity-30">
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 w-full">
          <button 
            onClick={() => navigate('/missions')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Missions
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {project.urgencyLevel === 'critical' && (
              <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                <Flame className="h-3 w-3" /> URGENT NEED
              </span>
            )}

            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {project.location}
                </span>
              )}
              {project.verificationStatus === 'verified' && (
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="h-4 w-4" /> Verified
                </span>
              )}
            </div>

            <p className="text-lg text-white/90 max-w-2xl">
              {project.summary}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 -mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Take Action
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button
              onClick={() => navigate('/pray')}
              variant="outline"
              className="flex flex-col items-center py-6 h-auto border-2 hover:border-[#D4A574] hover:bg-[#D4A574]/5"
              data-testid="button-project-pray"
            >
              <Heart className="h-6 w-6 text-[#D4A574] mb-2" />
              <span className="text-sm font-bold">Pray</span>
            </Button>

            <Button
              onClick={() => navigate('/give')}
              variant="outline"
              className="flex flex-col items-center py-6 h-auto border-2 hover:border-[#7C9A8E] hover:bg-[#7C9A8E]/5"
              data-testid="button-project-give"
            >
              <HandHeart className="h-6 w-6 text-[#7C9A8E] mb-2" />
              <span className="text-sm font-bold">Give</span>
            </Button>

            <Button
              onClick={() => setModalAction('training')}
              variant="outline"
              className="flex flex-col items-center py-6 h-auto border-2 hover:border-primary hover:bg-primary/5"
              data-testid="button-project-go"
            >
              <Globe className="h-6 w-6 text-primary mb-2" />
              <span className="text-sm font-bold">Go Digital</span>
            </Button>
          </div>

          {project.fundingGoal && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Funding Progress</span>
                <span className="font-bold text-gray-900">{fundingPercent}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#7C9A8E] to-[#4A7C7C] rounded-full transition-all"
                  style={{ width: `${fundingPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${((project.fundsRaised || 0) / 100).toLocaleString()} raised</span>
                <span>Goal: ${(project.fundingGoal / 100).toLocaleString()}</span>
              </div>
            </div>
          )}
        </motion.div>

        {project.story && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">The Story</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.story}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share This Mission
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Help spread the word and invite others to join.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                data-testid="button-share-link"
                onClick={() => setModalAction('share')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                data-testid="button-share-card"
                onClick={() => setModalAction('share')}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Card
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Join the Team
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect with others on this mission.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                data-testid="button-live-room"
                onClick={() => setModalAction('live-room')}
              >
                <Play className="h-4 w-4 mr-2" />
                Live Room
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                data-testid="button-follow-up"
                onClick={() => setModalAction('follow-up')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Follow-up
              </Button>
            </div>
          </div>
        </motion.div>

        {project.hasDigitalActions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl border border-primary/20 p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Digital Outreach Available</h3>
                <p className="text-sm text-gray-600">Take action from anywhere in the world</p>
              </div>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
              data-testid="button-start-digital"
              onClick={() => setModalAction('training')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Start Digital Action
            </Button>
          </motion.div>
        )}
      </main>

      <Footer />
      <MobileNav />

      <DigitalActionsModal
        isOpen={!!modalAction}
        onClose={() => setModalAction(null)}
        action={modalAction || 'share'}
        projectTitle={project?.title}
        projectId={project?.id}
      />
    </div>
  );
}
