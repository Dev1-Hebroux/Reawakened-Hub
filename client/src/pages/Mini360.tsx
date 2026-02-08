import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft, Users, Plus, Copy, CheckCircle2, Send, ArrowRight,
  BookOpen, Heart, MessageCircle, UserPlus, BarChart3, Mail,
  Eye, Trash2, Share2, X, Lightbulb
} from "lucide-react";
import { format } from "date-fns";
import { AICoachPanel } from "@/components/AICoachPanel";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface FeedbackCampaign {
  id: number;
  userId: string;
  title: string;
  focusDimensions: string[] | null;
  status: string;
  createdAt: string;
}

interface FeedbackInvite {
  id: number;
  campaignId: number;
  token: string;
  inviteeName: string | null;
  inviteeEmail: string;
  relationshipType: string | null;
  status: string;
}

interface FeedbackAggregate {
  id: number;
  campaignId: number;
  dimensionKey: string;
  avgRating: number | null;
  themesJson: string[] | null;
}

const DIMENSIONS = [
  { key: "communication", label: "Communication", description: "How clearly I express ideas and listen to others" },
  { key: "leadership", label: "Leadership", description: "How I guide, inspire, and support others" },
  { key: "collaboration", label: "Collaboration", description: "How well I work with others toward shared goals" },
  { key: "reliability", label: "Reliability", description: "How consistently I follow through on commitments" },
  { key: "empathy", label: "Empathy", description: "How well I understand and respond to others' feelings" },
  { key: "initiative", label: "Initiative", description: "How proactively I take action and solve problems" },
  { key: "adaptability", label: "Adaptability", description: "How well I handle change and new situations" },
  { key: "integrity", label: "Integrity", description: "How honest and principled I am in my actions" },
];

const RELATIONSHIP_TYPES = [
  { key: "peer", label: "Peer/Colleague" },
  { key: "mentor", label: "Mentor/Coach" },
  { key: "friend", label: "Friend" },
  { key: "family", label: "Family" },
  { key: "manager", label: "Manager/Leader" },
  { key: "other", label: "Other" },
];

export function Mini360() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"intro" | "campaigns" | "create" | "manage" | "results">("intro");
  const [selectedCampaign, setSelectedCampaign] = useState<FeedbackCampaign | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [newInvite, setNewInvite] = useState({ name: "", email: "", type: "peer" });
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: campaigns } = useQuery({
    queryKey: ["/api/user/feedback-campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/user/feedback-campaigns", { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as FeedbackCampaign[];
    },
  });

  const { data: invites } = useQuery({
    queryKey: ["/api/feedback-campaigns", selectedCampaign?.id, "invites"],
    queryFn: async () => {
      if (!selectedCampaign) return [];
      const res = await fetch(`/api/feedback-campaigns/${selectedCampaign.id}/invites`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as FeedbackInvite[];
    },
    enabled: !!selectedCampaign,
  });

  const { data: aggregates } = useQuery({
    queryKey: ["/api/feedback-campaigns", selectedCampaign?.id, "aggregates"],
    queryFn: async () => {
      if (!selectedCampaign) return [];
      const res = await fetch(`/api/feedback-campaigns/${selectedCampaign.id}/aggregates`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data as FeedbackAggregate[];
    },
    enabled: !!selectedCampaign && step === "results",
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson("/api/feedback-campaigns", {
        method: "POST",
        body: JSON.stringify({
          title: campaignTitle || "My 360 Feedback",
          focusDimensions: selectedDimensions,
          status: "draft",
        }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/feedback-campaigns"] });
      setSelectedCampaign(data.data);
      setCampaignTitle("");
      setSelectedDimensions([]);
      setStep("manage");
    },
  });

  const createInvite = useMutation({
    mutationFn: async () => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(`/api/feedback-campaigns/${selectedCampaign!.id}/invites`, {
        method: "POST",
        body: JSON.stringify({
          inviteeName: newInvite.name,
          inviteeEmail: newInvite.email,
          relationshipType: newInvite.type,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback-campaigns", selectedCampaign?.id, "invites"] });
      setNewInvite({ name: "", email: "", type: "peer" });
    },
  });

  const calculateResults = useMutation({
    mutationFn: async () => {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      return await apiFetchJson(`/api/feedback-campaigns/${selectedCampaign!.id}/calculate`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback-campaigns", selectedCampaign?.id, "aggregates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/feedback-campaigns"] });
      setStep("results");
    },
  });

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/feedback/respond/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const toggleDimension = (key: string) => {
    setSelectedDimensions(prev => 
      prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key].slice(0, 5)
    );
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-4 py-8">
        <div className="w-20 h-20 mx-auto bg-[#4A7C7C]/20 rounded-full flex items-center justify-center">
          <BarChart3 className="w-10 h-10 text-[#4A7C7C]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Mini-360 Feedback</h1>
        <p className="text-gray-600 max-w-sm mx-auto">
          Discover how others see you. Gather honest, anonymous feedback from people who know you well.
        </p>
      </div>

      <Card className="bg-[#FAF8F5] border-[#4A7C7C]/20">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4A7C7C]" />
            How Mini-360 Works
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#4A7C7C] text-white rounded-full flex items-center justify-center text-xs font-medium shrink-0">1</div>
              <p><strong>Choose Dimensions</strong> - Select 3-5 areas you want feedback on</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#4A7C7C] text-white rounded-full flex items-center justify-center text-xs font-medium shrink-0">2</div>
              <p><strong>Invite Responders</strong> - Share links with 3-8 people who know you</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#4A7C7C] text-white rounded-full flex items-center justify-center text-xs font-medium shrink-0">3</div>
              <p><strong>Collect Anonymous Feedback</strong> - They rate you without you seeing who said what</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-[#4A7C7C] text-white rounded-full flex items-center justify-center text-xs font-medium shrink-0">4</div>
              <p><strong>See Patterns</strong> - Review aggregated insights to identify blind spots</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#4A7C7C]/10 to-[#7C9A8E]/10 border-[#4A7C7C]/20">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D4A574]" />
            Biblical Foundation
          </h3>
          <p className="text-sm text-gray-600 italic">
            "As iron sharpens iron, so one person sharpens another." — Proverbs 27:17
          </p>
          <p className="text-sm text-gray-600">
            Honest feedback from others helps us grow in ways we can't see alone. 
            This tool creates a safe space for truth spoken in love.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          className="w-full bg-[#4A7C7C] hover:bg-[#3A6C6C] text-white py-6 text-lg"
          onClick={() => setStep("create")}
          data-testid="button-start-360"
        >
          Start My 360
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          variant="outline"
          className="w-full border-[#4A7C7C]/30 text-[#4A7C7C]"
          onClick={() => setStep("campaigns")}
          data-testid="button-view-campaigns"
        >
          View My Campaigns
        </Button>
      </div>
    </motion.div>
  );

  const renderCampaigns = () => (
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
          <h2 className="text-xl font-bold text-gray-800">My Campaigns</h2>
          <p className="text-sm text-gray-600">Track your feedback requests</p>
        </div>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="border-[#4A7C7C]/20 cursor-pointer hover:border-[#4A7C7C]/50 transition-colors"
              onClick={() => {
                setSelectedCampaign(campaign);
                setStep(campaign.status === "completed" ? "results" : "manage");
              }}
              data-testid={`card-campaign-${campaign.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    campaign.status === 'completed' ? 'bg-green-100' :
                    campaign.status === 'active' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {campaign.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <BarChart3 className="w-5 h-5 text-[#4A7C7C]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{campaign.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={`text-xs ${
                        campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {campaign.status}
                      </Badge>
                      {campaign.focusDimensions && (
                        <span className="text-xs text-gray-500">{campaign.focusDimensions.length} dimensions</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#FAF8F5] border-[#4A7C7C]/20">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">No Campaigns Yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start gathering feedback to discover your strengths and growth areas.
            </p>
            <Button
              className="bg-[#4A7C7C] hover:bg-[#3A6C6C] text-white"
              onClick={() => setStep("create")}
              data-testid="button-create-first"
            >
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  const renderCreate = () => (
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
          <h2 className="text-xl font-bold text-gray-800">Create Campaign</h2>
          <p className="text-sm text-gray-600">Choose what you want feedback on</p>
        </div>
      </div>

      <Card className="border-[#4A7C7C]/20">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Campaign Title (optional)</label>
            <Input
              placeholder="e.g., Q1 Leadership Feedback"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              className="border-[#4A7C7C]/30"
              data-testid="input-title"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-800">Select 3-5 Dimensions</h3>
        <p className="text-sm text-gray-500">What areas would you like feedback on?</p>
        
        <div className="grid gap-2">
          {DIMENSIONS.map((dim) => (
            <Card
              key={dim.key}
              className={`border cursor-pointer transition-all ${
                selectedDimensions.includes(dim.key) 
                  ? 'border-[#4A7C7C] bg-[#4A7C7C]/5' 
                  : 'border-gray-200 hover:border-[#4A7C7C]/50'
              }`}
              onClick={() => toggleDimension(dim.key)}
              data-testid={`card-dimension-${dim.key}`}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedDimensions.includes(dim.key) 
                    ? 'border-[#4A7C7C] bg-[#4A7C7C]' 
                    : 'border-gray-300'
                }`}>
                  {selectedDimensions.includes(dim.key) && (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800">{dim.label}</h4>
                  <p className="text-xs text-gray-500 truncate">{dim.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button
        className="w-full bg-[#4A7C7C] hover:bg-[#3A6C6C] text-white py-6"
        onClick={() => createCampaign.mutate()}
        disabled={selectedDimensions.length < 3 || createCampaign.isPending}
        data-testid="button-create-campaign"
      >
        {createCampaign.isPending ? "Creating..." : "Create Campaign"}
      </Button>
    </motion.div>
  );

  const renderManage = () => (
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
            setSelectedCampaign(null);
            setStep("campaigns");
          }}
          className="shrink-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{selectedCampaign?.title}</h2>
          <p className="text-sm text-gray-600">Invite people to give you feedback</p>
        </div>
      </div>

      <Card className="border-[#4A7C7C]/20 bg-[#FAF8F5]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Responses</span>
            <Badge variant="secondary">{invites?.filter(i => i.status === 'submitted').length || 0} / {invites?.length || 0}</Badge>
          </div>
          <Progress 
            value={invites?.length ? (invites.filter(i => i.status === 'submitted').length / invites.length) * 100 : 0} 
            className="h-2"
          />
          <p className="text-xs text-gray-500 mt-2">Aim for 3-8 respondents for meaningful insights</p>
        </CardContent>
      </Card>

      <Card className="border-[#4A7C7C]/20">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#4A7C7C]" />
            Add Responder
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Name (optional)"
              value={newInvite.name}
              onChange={(e) => setNewInvite(prev => ({ ...prev, name: e.target.value }))}
              className="border-[#4A7C7C]/30"
              data-testid="input-invite-name"
            />
            <Input
              placeholder="Email address"
              type="email"
              value={newInvite.email}
              onChange={(e) => setNewInvite(prev => ({ ...prev, email: e.target.value }))}
              className="border-[#4A7C7C]/30"
              data-testid="input-invite-email"
            />
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_TYPES.map((type) => (
                <Button
                  key={type.key}
                  size="sm"
                  variant={newInvite.type === type.key ? "default" : "outline"}
                  className={newInvite.type === type.key ? "bg-[#4A7C7C]" : "border-[#4A7C7C]/30"}
                  onClick={() => setNewInvite(prev => ({ ...prev, type: type.key }))}
                  data-testid={`button-type-${type.key}`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
            <Button
              className="w-full bg-[#4A7C7C] hover:bg-[#3A6C6C] text-white"
              onClick={() => createInvite.mutate()}
              disabled={!newInvite.email || createInvite.isPending}
              data-testid="button-add-invite"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Responder
            </Button>
          </div>
        </CardContent>
      </Card>

      {invites && invites.length > 0 && (
        <Card className="border-[#4A7C7C]/20">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium text-gray-800">Invited Responders</h3>
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 truncate">{invite.inviteeName || invite.inviteeEmail}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{invite.relationshipType}</Badge>
                    <Badge variant={invite.status === 'submitted' ? 'default' : 'secondary'} className={`text-xs ${
                      invite.status === 'submitted' ? 'bg-green-100 text-green-700' : ''
                    }`}>
                      {invite.status}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyInviteLink(invite.token)}
                  data-testid={`button-copy-${invite.id}`}
                >
                  {copiedToken === invite.token ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full bg-[#7C9A8E] hover:bg-[#6B8A7D] text-white py-6"
        onClick={() => calculateResults.mutate()}
        disabled={!invites || invites.filter(i => i.status === 'submitted').length < 2 || calculateResults.isPending}
        data-testid="button-calculate-results"
      >
        <BarChart3 className="w-5 h-5 mr-2" />
        {calculateResults.isPending ? "Calculating..." : "View Results"}
      </Button>
      <p className="text-xs text-gray-500 text-center">Need at least 2 responses to view results</p>
    </motion.div>
  );

  const renderResults = () => (
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
            setSelectedCampaign(null);
            setStep("campaigns");
          }}
          className="shrink-0"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Your Results</h2>
          <p className="text-sm text-gray-600">{selectedCampaign?.title}</p>
        </div>
      </div>

      {aggregates && aggregates.length > 0 ? (
        <div className="space-y-4">
          {aggregates.map((agg) => {
            const dimension = DIMENSIONS.find(d => d.key === agg.dimensionKey);
            const rating = agg.avgRating ? agg.avgRating / 10 : 0;
            return (
              <Card key={agg.id} className="border-[#4A7C7C]/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{dimension?.label || agg.dimensionKey}</h3>
                    <span className="text-lg font-bold text-[#4A7C7C]">{rating.toFixed(1)}/5</span>
                  </div>
                  <Progress value={rating * 20} className="h-3" />
                  <p className="text-xs text-gray-500">{dimension?.description}</p>
                  {agg.themesJson && agg.themesJson.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Comments:
                      </p>
                      <div className="space-y-1">
                        {agg.themesJson.slice(0, 3).map((comment, i) => (
                          <p key={i} className="text-sm text-gray-600 italic">"{comment}"</p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <Card className="bg-gradient-to-br from-[#4A7C7C]/10 to-[#7C9A8E]/10 border-[#4A7C7C]/20">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#D4A574]" />
                Key Insights
              </h3>
              <p className="text-sm text-gray-600">
                Your highest-rated areas show where others see your strengths. 
                Lower scores indicate opportunities for growth - these are gifts of insight from people who care about you.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-[#FAF8F5] border-[#4A7C7C]/20">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">Results Not Ready</h3>
            <p className="text-sm text-gray-500">
              We need more responses before we can show you meaningful results.
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-24 md:pb-12">
        <div className="max-w-md mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {step === "intro" && renderIntro()}
            {step === "campaigns" && renderCampaigns()}
            {step === "create" && renderCreate()}
            {step === "manage" && renderManage()}
            {step === "results" && renderResults()}
          </AnimatePresence>
        </div>

        <AICoachPanel
          tool="360"
          data={{
            selectedCampaign: selectedCampaign?.title,
            selectedDimensions: selectedDimensions,
            step: step,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
