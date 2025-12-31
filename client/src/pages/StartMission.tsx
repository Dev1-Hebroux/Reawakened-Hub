import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  HandHeart, 
  Globe, 
  Users, 
  BookOpen,
  Flame,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Music,
  Mic,
  Settings,
  Video,
  MessageCircle
} from "lucide-react";

const STEPS = ['burden', 'actions', 'availability', 'skills', 'confirm'] as const;
type Step = typeof STEPS[number];

const burdens = [
  { id: 'nations', label: 'Unreached Nations', icon: Globe, description: 'Reach those who have never heard' },
  { id: 'youth', label: 'Young People', icon: Users, description: 'Disciple the next generation' },
  { id: 'evangelism', label: 'Evangelism', icon: Flame, description: 'Share the gospel boldly' },
  { id: 'discipleship', label: 'Discipleship', icon: BookOpen, description: 'Grow deeper in faith' },
  { id: 'mercy', label: 'Mercy & Justice', icon: Heart, description: 'Serve the vulnerable' },
  { id: 'prayer', label: 'Prayer Movement', icon: Sparkles, description: 'Intercede for revival' },
];

const actions = [
  { id: 'pray', label: 'Pray', icon: Heart, color: 'from-[#D4A574] to-[#C49466]', description: 'Intercede daily for the nations' },
  { id: 'give', label: 'Give', icon: HandHeart, color: 'from-[#7C9A8E] to-[#6A8A7E]', description: 'Fund gospel workers & projects' },
  { id: 'go', label: 'Go Digital', icon: Globe, color: 'from-primary to-orange-500', description: 'Take action online from anywhere' },
];

const availabilityOptions = [
  { id: 5, label: '5 min', description: 'Quick daily prayer' },
  { id: 10, label: '10 min', description: 'Prayer + devotional' },
  { id: 15, label: '15 min', description: 'Deeper intercession' },
  { id: 30, label: '30+ min', description: 'Extended worship & prayer' },
];

const skills = [
  { id: 'teaching', label: 'Teaching', icon: BookOpen },
  { id: 'music', label: 'Music/Worship', icon: Music },
  { id: 'speaking', label: 'Speaking', icon: Mic },
  { id: 'admin', label: 'Administration', icon: Settings },
  { id: 'media', label: 'Media/Video', icon: Video },
  { id: 'evangelism', label: 'Evangelism', icon: Flame },
  { id: 'counseling', label: 'Counseling', icon: MessageCircle },
  { id: 'tech', label: 'Technology', icon: Globe },
];

export default function StartMission() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>('burden');
  const [formData, setFormData] = useState({
    primaryBurden: '',
    actionsPreference: [] as string[],
    availabilityMinutes: 10,
    skills: [] as string[],
    travelReadiness: 'exploring',
  });

  const stepIndex = STEPS.indexOf(currentStep);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/mission/me/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mission/me/profile'] });
      navigate('/missions');
    },
  });

  const nextStep = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  };

  const prevStep = () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  };

  const toggleAction = (id: string) => {
    setFormData(prev => ({
      ...prev,
      actionsPreference: prev.actionsPreference.includes(id)
        ? prev.actionsPreference.filter(a => a !== id)
        : [...prev.actionsPreference, id],
    }));
  };

  const toggleSkill = (id: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter(s => s !== id)
        : [...prev.skills, id],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'burden': return !!formData.primaryBurden;
      case 'actions': return formData.actionsPreference.length > 0;
      case 'availability': return !!formData.availabilityMinutes;
      case 'skills': return true;
      case 'confirm': return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2744] via-[#1a2744]/95 to-[#FAF8F5] text-foreground pb-20 md:pb-0">
      <Navbar />
      
      <section className="pt-28 pb-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-4 py-2 text-sm font-bold mb-4">
              <Flame className="h-4 w-4" />
              Start Your Mission
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              {currentStep === 'burden' && "What's Your Heart For?"}
              {currentStep === 'actions' && "How Will You Engage?"}
              {currentStep === 'availability' && "How Much Time?"}
              {currentStep === 'skills' && "What Are Your Gifts?"}
              {currentStep === 'confirm' && "You're Ready!"}
            </h1>
            <div className="flex justify-center gap-2 mt-6">
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i <= stepIndex ? 'bg-primary' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-xl mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {currentStep === 'burden' && (
            <motion.div
              key="burden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <p className="text-gray-600 mb-6 text-center">
                Select the area where God has placed a burden on your heart.
              </p>
              <div className="grid gap-3">
                {burdens.map((burden) => (
                  <button
                    key={burden.id}
                    onClick={() => setFormData(prev => ({ ...prev, primaryBurden: burden.id }))}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      formData.primaryBurden === burden.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`burden-${burden.id}`}
                  >
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      formData.primaryBurden === burden.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <burden.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{burden.label}</div>
                      <div className="text-sm text-gray-500">{burden.description}</div>
                    </div>
                    {formData.primaryBurden === burden.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <p className="text-gray-600 mb-6 text-center">
                Choose how you want to participate. Select all that apply.
              </p>
              <div className="grid gap-4">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      formData.actionsPreference.includes(action.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`action-${action.id}`}
                  >
                    {formData.actionsPreference.includes(action.id) && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3`}>
                      <action.icon className="h-7 w-7" />
                    </div>
                    <div className="font-bold text-gray-900 text-lg">{action.label}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'availability' && (
            <motion.div
              key="availability"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <p className="text-gray-600 mb-6 text-center">
                How much time can you commit daily to prayer and action?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {availabilityOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData(prev => ({ ...prev, availabilityMinutes: option.id }))}
                    className={`p-6 rounded-xl border-2 transition-all text-center ${
                      formData.availabilityMinutes === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`availability-${option.id}`}
                  >
                    <div className={`h-12 w-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      formData.availabilityMinutes === option.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Clock className="h-6 w-6" />
                    </div>
                    <div className="font-bold text-gray-900 text-lg">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <p className="text-gray-600 mb-6 text-center">
                What gifts has God given you? (Optional - select any that apply)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      formData.skills.includes(skill.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`skill-${skill.id}`}
                  >
                    <skill.icon className={`h-5 w-5 ${
                      formData.skills.includes(skill.id) ? 'text-primary' : 'text-gray-400'
                    }`} />
                    <span className="font-medium text-gray-900 text-sm">{skill.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Flame className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Mission Awaits</h3>
              <p className="text-gray-600 mb-6">
                You're ready to join the movement. Your personalized mission dashboard is waiting.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left" data-testid="summary-container">
                <div className="text-sm text-gray-500 mb-2">Your focus:</div>
                <div className="font-bold text-gray-900 capitalize" data-testid="text-focus">
                  {burdens.find(b => b.id === formData.primaryBurden)?.label}
                </div>
                <div className="text-sm text-gray-500 mt-3 mb-2">Your commitment:</div>
                <div className="font-bold text-gray-900" data-testid="text-commitment">
                  {formData.actionsPreference.map(a => actions.find(ac => ac.id === a)?.label).join(', ')} 
                  {' • '}{formData.availabilityMinutes} min/day
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {stepIndex > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1"
              data-testid="button-prev"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep !== 'confirm' ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex-1 bg-primary hover:bg-primary/90"
              data-testid="button-next"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
              data-testid="button-start-mission"
            >
              {saveMutation.isPending ? 'Saving...' : 'Start My Mission'}
              <Flame className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
