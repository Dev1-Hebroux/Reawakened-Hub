import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./Admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Plus, Loader2, Target, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const challengeTypes = [
  { value: "prayer", label: "Prayer Challenge" },
  { value: "reading", label: "Bible Reading" },
  { value: "outreach", label: "Outreach Challenge" },
  { value: "fasting", label: "Fasting Challenge" },
  { value: "giving", label: "Giving Challenge" },
];

export function AdminChallenges() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "prayer",
    duration: "7",
    startDate: "",
    actions: "",
  });

  const { data: challenges = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/challenges"],
  });

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      type: "prayer",
      duration: "7",
      startDate: "",
      actions: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Challenge created! (Feature coming soon)");
    closeModal();
  };

  const exampleChallenges = [
    {
      id: 1,
      title: "7-Day Prayer Challenge",
      description: "Commit to praying for 30 minutes each day for one week",
      type: "prayer",
      duration: 7,
      participants: 45,
      status: "active",
    },
    {
      id: 2,
      title: "30-Day Bible Reading",
      description: "Read through the Gospel of John in 30 days",
      type: "reading",
      duration: 30,
      participants: 128,
      status: "completed",
    },
    {
      id: 3,
      title: "Acts of Kindness Week",
      description: "Perform one random act of kindness each day",
      type: "outreach",
      duration: 7,
      participants: 67,
      status: "upcoming",
    },
  ];

  return (
    <AdminLayout 
      title="Challenges Manager" 
      subtitle="Create and manage community challenges"
      actions={
        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" /> New Challenge
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-xs text-gray-500">Total Challenges</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">1</div>
              <div className="text-xs text-gray-500">Active Now</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">240</div>
              <div className="text-xs text-gray-500">Total Participants</div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge List */}
      <div className="space-y-4">
        {exampleChallenges.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-7 w-7 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  challenge.status === "active" 
                    ? "bg-green-100 text-green-700"
                    : challenge.status === "completed"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {challenge.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{challenge.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {challenge.duration} days
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {challenge.participants} participants
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Create Challenge Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Challenge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 21-Day Prayer Challenge"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this challenge about?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {challengeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (days)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="7"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Daily Actions (one per line)</label>
              <Textarea
                value={formData.actions}
                onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                placeholder="Pray for 30 minutes&#10;Read a Psalm&#10;Share with a friend"
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                Create Challenge
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminChallenges;
