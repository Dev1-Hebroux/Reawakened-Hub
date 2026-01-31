import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Foundations } from "@/components/sections/Foundations";
import { GrowthToolsSection } from "@/components/sections/GrowthToolsSection";
import type { Event } from "@shared/schema";
import { GLOBAL_IMPACT_CARDS, COMMITMENT_LEVELS } from "@/lib/home-constants";
import { DailySparks } from "@/components/sections/DailySparks";
import { CommunityRooms } from "@/components/sections/CommunityRooms";
import { DiscipleshipPaths } from "@/components/sections/DiscipleshipPaths";
import { MarqueeCTA } from "@/components/sections/MarqueeCTA";
import { SubscriptionCapture } from "@/components/sections/SubscriptionCapture";
import { Footer } from "@/components/layout/Footer";
import { VisionGetStartedCard } from "@/components/VisionGetStartedCard";
import { VisionPromptModal } from "@/components/VisionPromptModal";
import { WdepPinnedAction, ScaFocusCard } from "@/components/DashboardPinnedCards";
import { ArrowRight, ShoppingBag, Flame, Heart, Globe, Zap, Rocket, HandHeart, Users, Clock, CheckCircle2, Compass, Target, TrendingUp, Calendar, MapPin, Loader2 } from "lucide-react";
import { StatsBar } from "@/components/ui/StatsBar";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";

import outreachImg from "@assets/generated_images/group_wearing_reawakened.one_branded_t-shirts.png";
import capImg from "@assets/generated_images/cap_with_reawakened_embroidery.png";
import hoodieImg from "@assets/generated_images/hoodies_with_reawakened_logo.png";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedCommitment, setSelectedCommitment] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const featuredEvents = events
    .slice(0, 2)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden relative">
      <SEO
        title="Reawakened"
        description="A digital revival movement - Encounter Jesus, grow in discipleship, and engage in global outreach. Join thousands in daily devotionals, prayer, and missions."
      />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />
      <VisionPromptModal />
      <main className="relative z-10">
        <Hero />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <StatsBar variant="light" />
        </div>

        {isAuthenticated && (
          <section className="py-8 bg-gradient-to-b from-white to-gray-50/30">
            <div className="max-w-lg mx-auto px-4 space-y-4">
              <VisionGetStartedCard />
              <WdepPinnedAction />
              <ScaFocusCard />
            </div>
          </section>
        )}

        {/* Side-by-side: Daily Sparks + Daily Commitment */}
        <section id="sparks" className="py-10 md:py-14 bg-white relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
              {/* Left: Daily Sparks Featured */}
              <div>
                <div className="mb-4">
                  <span className="text-primary font-bold tracking-wider uppercase text-xs">Daily Inspiration</span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 leading-tight mt-1">
                    Ignite Your <span className="text-primary">Spiritual Journey</span>
                  </h2>
                </div>
                <Link href="/sparks">
                  <button
                    data-testid="button-view-all-sparks-inline"
                    className="mb-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-sm"
                  >
                    View All Sparks <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <DailySparks compact />
              </div>

              {/* Right: Daily Commitment */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-5"
                >
                  <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 mb-3">
                    <Clock className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-700">Daily Commitment</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900">How much time will you give?</h3>
                </motion.div>

                <div className="grid grid-cols-3 gap-2">
                  {COMMITMENT_LEVELS.map((level, index) => (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCommitment(level.id);
                        navigate('/pray');
                      }}
                      className={`relative p-3 md:p-4 rounded-xl border-2 transition-all text-center bg-[#F5F7F6] hover:shadow-md ${selectedCommitment === level.id
                        ? 'border-primary shadow-md'
                        : 'border-transparent hover:border-gray-200'
                        }`}
                      data-testid={`commitment-${level.id}`}
                    >
                      <div className={`h-10 w-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center shadow-sm`}>
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{level.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{level.description}</div>
                    </motion.button>
                  ))}
                </div>

                {selectedCommitment && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Button
                      onClick={() => navigate(`/pray?duration=${parseInt(selectedCommitment)}`)}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold px-6 py-4 rounded-xl shadow-lg"
                      data-testid="button-start-commitment"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Start Today's Prayer
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>

        <Foundations />
        <GrowthToolsSection />

        {/* Vision Journey Section */}
        <section className="py-20 bg-gradient-to-b from-[#FAF8F5] to-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-10 w-64 h-64 bg-[#7C9A8E]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#4A7C7C]/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C9A8E]/20 to-[#4A7C7C]/20 rounded-full px-4 py-2 mb-4">
                <Compass className="h-4 w-4 text-[#7C9A8E]" />
                <span className="text-sm font-bold text-[#7C9A8E]">Vision & Goals</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Design Your Next Season
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Get crystal clear on where you're headed. Our proven 5-stage framework helps you turn dreams into daily action.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
            >
              {[
                { icon: Compass, label: "Clarity", desc: "Know where you are", color: "from-[#7C9A8E] to-[#6B8B7E]" },
                { icon: Heart, label: "Alignment", desc: "Match your values", color: "from-[#9B8AA6] to-[#8A7995]" },
                { icon: Target, label: "Direction", desc: "Set SMART goals", color: "from-[#4A7C7C] to-[#3A6C6C]" },
                { icon: TrendingUp, label: "Consistency", desc: "Build lasting habits", color: "from-[#D4A574] to-[#C49464]" },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  data-testid={`card-vision-${item.label.toLowerCase()}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-md`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <Button
                onClick={() => navigate('/vision')}
                className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white font-bold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                data-testid="button-start-vision-home"
              >
                <Compass className="h-5 w-5 mr-2" />
                Start Your Vision Journey
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        <MarqueeCTA />

        <section className="py-24 bg-gray-50/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Wear the Vision</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">Represent the Movement</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of watchmen carrying the message on the streets, in schools, and across nations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer">
                <img src={outreachImg} alt="Community Outreach" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Community Gear</h3>
                  <button
                    onClick={() => toast({ title: "Coming Soon", description: "Our shop is launching soon! Stay tuned." })}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all"
                    data-testid="button-merch-community"
                  >
                    View Collection <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer md:-mt-8">
                <img src={capImg} alt="Signature Cap" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">BESTSELLER</span>
                  <h3 className="text-2xl font-bold text-white mb-2">Signature Caps</h3>
                  <button
                    onClick={() => toast({ title: "Coming Soon", description: "Our shop is launching soon! Stay tuned." })}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all"
                    data-testid="button-merch-caps"
                  >
                    Shop Accessories <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="group relative h-[400px] rounded-[30px] overflow-hidden cursor-pointer">
                <img src={hoodieImg} alt="Worship Hoodies" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Revival Hoodies</h3>
                  <button
                    onClick={() => toast({ title: "Coming Soon", description: "Our shop is launching soon! Stay tuned." })}
                    className="flex items-center gap-2 text-white/80 hover:text-white font-medium group-hover:gap-3 transition-all"
                    data-testid="button-merch-hoodies"
                  >
                    Get Yours <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => navigate("/community")}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
                data-testid="button-visit-hub"
              >
                <ShoppingBag className="h-5 w-5" /> Visit the Hub
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#1a2744] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 bg-[#D4A574] rounded-full px-4 py-2 mb-6 shadow-lg">
                  <Globe className="h-4 w-4 text-white" />
                  <span className="text-sm font-bold text-white">Global Impact</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                  Ready to Change<br />the World?
                </h2>
                <p className="text-lg text-[#E8E4DE] mb-8 max-w-md">
                  Don't just watch. Act. Reawakened is your launchpad to pray, give, and go to the nations.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate('/outreach')}
                    className="bg-white hover:bg-gray-100 text-[#1a2744] font-bold px-8 py-6 rounded-full shadow-xl"
                    data-testid="button-start-mission"
                  >
                    Start Your Mission
                  </Button>
                  <Button
                    onClick={() => navigate('/outreach')}
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-full"
                    data-testid="button-view-projects"
                  >
                    View Projects
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                {GLOBAL_IMPACT_CARDS.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(card.link)}
                    className="bg-[#243656] hover:bg-[#2a3f66] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all group border border-[#4A7C7C]/20 shadow-lg"
                    data-testid={`card-impact-${card.title.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#1a2744] flex items-center justify-center shadow-md">
                        <card.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{card.title}</h3>
                        <p className="text-sm text-[#7C9A8E]">{card.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[#7C9A8E] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-[#7C9A8E] mb-4">Join the global movement of young believers taking action</p>
              <div className="flex justify-center gap-8 items-center">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D4A574] to-[#7C9A8E] border-2 border-[#1a2744] flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">2,500+ active missionaries</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-16 bg-gradient-to-b from-white to-[#FAF8F5] relative">
          <div className="max-w-lg mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-[#D4A574]/20 rounded-full px-4 py-2 mb-4">
                <Calendar className="h-4 w-4 text-[#D4A574]" />
                <span className="text-sm font-bold text-[#D4A574]">Upcoming Events</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">
                Join Us In Person
              </h2>
              <p className="text-gray-600">
                Connect with the movement through gatherings, training, and outreach events
              </p>
            </motion.div>

            <div className="space-y-4 mb-6">
              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : featuredEvents.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-gray-500">No upcoming events scheduled at the moment.</p>
                </div>
              ) : (
                featuredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate("/outreach#events")}
                    className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all group"
                    data-testid={`event-highlight-${event.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${index % 2 === 0 ? "from-[#D4A574] to-[#C49464]" : "from-[#4A7C7C] to-[#3A6C6C]"
                        } flex items-center justify-center flex-shrink-0`}>
                        {index % 2 === 0 ? <Calendar className="h-7 w-7 text-white" /> : <Globe className="h-7 w-7 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#4A7C7C] transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(event.startDate)}</span>
                          <span className="text-gray-300">•</span>
                          {event.location && (
                            <>
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#4A7C7C] group-hover:translate-x-1 transition-all mt-1" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate("/outreach#events")}
                variant="outline"
                className="border-[#4A7C7C] text-[#4A7C7C] hover:bg-[#4A7C7C] hover:text-white rounded-full px-6"
                data-testid="button-view-all-events"
              >
                View All Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        <CommunityRooms />
        <DiscipleshipPaths />

        <section className="py-16 bg-gradient-to-br from-primary via-primary to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] " />
          </div>

          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white mb-4"
              >
                <Zap className="h-6 w-6" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                Stay Ignited. Stay Connected.
              </h2>
              <p className="text-sm text-white/80">
                Join thousands receiving weekly inspiration and mission updates.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SubscriptionCapture
                variant="card"
                title="Join the Movement"
                subtitle="Get daily sparks, mission updates, and prayer points delivered to your inbox."
                showCategories={true}
                showWhatsApp={true}
              />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
