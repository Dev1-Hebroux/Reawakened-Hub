import { Button } from "@/components/ui/button";
import { Printer, Download, Mail, Calendar, ArrowRight, Heart, Users, Globe, Target, Sparkles, BookOpen, GraduationCap, Lightbulb, Plane } from "lucide-react";
import logoImage from "@assets/Reawakened_Logo_1_new_1767191127649.png";

export function PartnerVision() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={handlePrint}
          className="bg-[#1a2744] hover:bg-[#243656] text-white shadow-lg"
          data-testid="button-print-vision"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print / Save as PDF
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 print:px-12 print:py-8">
        <header className="text-center mb-12 print:mb-8">
          <img 
            src={logoImage} 
            alt="Reawakened" 
            className="h-16 mx-auto mb-6 print:h-12"
          />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#1a2744] mb-4 print:text-3xl">
            Reaching the Next Generation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto print:text-base">
            A digital revival movement preparing young people to encounter Jesus, find their purpose, and change the world.
          </p>
        </header>

        <section className="mb-12 print:mb-8">
          <div className="bg-gradient-to-r from-[#1a2744] to-[#243656] rounded-2xl p-8 text-white print:bg-[#1a2744] print:p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 print:text-xl">
              <Heart className="h-6 w-6 text-[#D4A574]" />
              The Heart of Our Mission
            </h2>
            <p className="text-lg leading-relaxed text-white/90 print:text-base">
              We exist to reach young people aged 15-35 across the globe—non-Christians, seekers, 
              those losing their faith, and believers going cold. Our mission is simple: 
              <strong className="text-[#D4A574]"> Encounter → Equip → Mobilise</strong>.
            </p>
            <p className="text-lg leading-relaxed text-white/90 mt-4 print:text-base">
              We believe this generation is hungry for meaning, purpose, and authentic spiritual encounter. 
              Through digital tools and real-world community, we're creating pathways for them to 
              discover Jesus, grow in faith, and become agents of transformation in their spheres of influence.
            </p>
          </div>
        </section>

        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-6 flex items-center gap-2 print:text-xl">
            <Target className="h-6 w-6 text-[#4A7C7C]" />
            Our Target Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3">
            {[
              { value: "5,000", label: "Disciples by 2030", icon: Users },
              { value: "50+", label: "Nations Reached", icon: Globe },
              { value: "365", label: "Daily Sparks/Year", icon: Sparkles },
              { value: "100+", label: "Campus Movements", icon: BookOpen },
            ].map((stat, i) => (
              <div 
                key={i}
                className="bg-[#FAF8F5] rounded-xl p-6 text-center border border-[#4A7C7C]/20 print:p-4"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-[#4A7C7C] print:h-6 print:w-6" />
                <div className="text-3xl font-bold text-[#1a2744] print:text-2xl">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 print:mb-8 print:break-before-page">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-6 flex items-center gap-2 print:text-xl">
            <Sparkles className="h-6 w-6 text-[#D4A574]" />
            How We Reach Them
          </h2>
          <div className="grid md:grid-cols-3 gap-6 print:gap-4">
            {[
              {
                title: "Encounter",
                description: "Daily devotionals (Sparks), prayer campaigns, and digital content designed to meet people where they are spiritually.",
                color: "bg-[#7C9A8E]"
              },
              {
                title: "Equip",
                description: "Vision pathways, Bible reading plans, growth tools, and discipleship journeys that build strong foundations.",
                color: "bg-[#4A7C7C]"
              },
              {
                title: "Mobilise",
                description: "Mission training, outreach opportunities, and community engagement that turns believers into world-changers.",
                color: "bg-[#D4A574]"
              }
            ].map((pillar, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden print:border print:border-gray-200">
                <div className={`${pillar.color} h-2`} />
                <div className="p-6 print:p-4">
                  <h3 className="text-xl font-bold text-[#1a2744] mb-2">{pillar.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-6 flex items-center gap-2 print:text-xl">
            <Users className="h-6 w-6 text-[#4A7C7C]" />
            Our Channels
          </h2>
          <p className="text-gray-600 mb-6 print:text-sm">
            Beyond digital, we reach young people through three key operational channels:
          </p>
          <div className="grid md:grid-cols-3 gap-6 print:gap-4">
            {[
              {
                title: "Global Outreach",
                description: "From school assemblies to outreaches. We are possessing our inheritance and harvesting the nations through trips, camps, and community service.",
                tags: ["School Tours", "Holiday Trips", "City Impact"],
                icon: Plane,
                color: "bg-[#1a2744]"
              },
              {
                title: "Reawakened Academy",
                description: "Comprehensive discipleship and professional development. Including Alpha courses, leadership training, and career mentorship pathways.",
                tags: ["Discipleship", "Alpha Training", "Career Dev"],
                icon: GraduationCap,
                color: "bg-[#4A7C7C]"
              },
              {
                title: "Innovation Hub",
                description: "A cutting-edge ecosystem for IT, AI capability, and business incubation. Empowering the next generation of kingdom entrepreneurs and creators.",
                tags: ["AI Labs", "Startup Incubator", "Tech Skills"],
                icon: Lightbulb,
                color: "bg-[#D4A574]"
              }
            ].map((channel, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden print:border print:border-gray-200">
                <div className={`${channel.color} p-4 flex items-center gap-3`}>
                  <channel.icon className="h-6 w-6 text-white" />
                  <h3 className="text-lg font-bold text-white">{channel.title}</h3>
                </div>
                <div className="p-5 print:p-4">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{channel.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {channel.tags.map((tag, j) => (
                      <span 
                        key={j} 
                        className="text-xs font-medium px-2 py-1 rounded-full bg-[#FAF8F5] text-[#1a2744] border border-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-6 flex items-center gap-2 print:text-xl">
            <Globe className="h-6 w-6 text-[#7C9A8E]" />
            Platform Capabilities
          </h2>
          <div className="bg-[#FAF8F5] rounded-xl p-6 print:p-4">
            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              {[
                "DOMINION Campaign – 30-day devotional journeys",
                "Daily Sparks – Seeker-sensitive & faith-building content",
                "Vision Pathway – Life planning with SMART goals",
                "Bible Reading Plans – Personalized spiritual growth",
                "Community Hub – Prayer walls & accountability",
                "Mission Training – Equipping for global outreach",
                "AI Coach (Awake) – Personalized guidance",
                "Event Management – Gatherings & outreaches",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-[#4A7C7C] mt-1 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-12 print:mb-8 page-break-before print:break-before-page">
          <div className="bg-gradient-to-r from-[#4A7C7C] to-[#3A6C6C] rounded-2xl p-8 text-white print:p-6">
            <h2 className="text-2xl font-bold mb-4 print:text-xl">Partner With Us</h2>
            <p className="text-lg text-white/90 mb-6 print:text-base">
              We're looking for trustees, partners, and supporters who share our heart for the next generation. 
              Here's how you can help make this vision a reality:
            </p>
            <div className="grid md:grid-cols-3 gap-4 print:gap-3">
              {[
                { title: "Pray", description: "Join our prayer network for spiritual breakthrough" },
                { title: "Partner", description: "Collaborate through expertise, networks, or resources" },
                { title: "Give", description: "Fund the movement to reach more young people" },
              ].map((action, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 print:p-3">
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-white/80">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="text-center print:mt-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 print:text-xl">Let's Connect</h2>
          <p className="text-gray-600 mb-6 print:text-sm">
            We'd love to share more about our vision and explore how we can partner together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
            <Button
              onClick={() => window.location.href = "mailto:hello@reawakened.app?subject=Partnership Inquiry"}
              className="bg-[#1a2744] hover:bg-[#243656] text-white"
              data-testid="button-email-partner"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Us
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "https://reawakened.app"}
              className="border-[#1a2744] text-[#1a2744] hover:bg-[#1a2744] hover:text-white"
              data-testid="button-visit-platform"
            >
              <Globe className="h-4 w-4 mr-2" />
              Visit Platform
            </Button>
          </div>
          <div className="hidden print:block mt-4">
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> hello@reawakened.app | <strong>Website:</strong> reawakened.app
            </p>
          </div>
        </section>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center print:mt-8 print:pt-4">
          <p className="text-sm text-gray-500">
            Reawakened © {new Date().getFullYear()} | Encounter → Equip → Mobilise
          </p>
        </footer>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
