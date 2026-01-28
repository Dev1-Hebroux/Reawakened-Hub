import { Heart, HandHeart, Rocket, Zap } from "lucide-react";

export const GLOBAL_IMPACT_CARDS = [
    {
        title: "Pray",
        subtitle: "Adopt a people group",
        icon: Heart,
        link: "/pray",
    },
    {
        title: "Give",
        subtitle: "Support mission projects",
        icon: HandHeart,
        link: "/give",
    },
    {
        title: "Go",
        subtitle: "Join outreach trips",
        icon: Rocket,
        link: "/missions",
    },
    {
        title: "Movement",
        subtitle: "Join the revival",
        icon: Zap,
        link: "/movement",
    },
];

export const COMMITMENT_LEVELS = [
    { id: "5min", label: "5 min", description: "Daily prayer", color: "from-[#D4A574] to-[#C49466]" },
    { id: "15min", label: "15 min", description: "Prayer + devotional", color: "from-[#7C9A8E] to-[#6A8A7E]" },
    { id: "30min", label: "30 min", description: "Full intercession", color: "from-primary to-orange-500" },
];
