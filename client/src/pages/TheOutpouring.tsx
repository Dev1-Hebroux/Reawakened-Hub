import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionCapture } from "@/components/sections/SubscriptionCapture";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CloudRain, BookOpen, Ear, Flame, ArrowRight } from "lucide-react";

// Hero & section images
import heroImg from "@assets/generated_images/day_14_faith_through_fire.png";
import spiritImg from "@assets/generated_images/day_4_hands_reaching_light.png";
import baptismImg from "@assets/generated_images/day_1_identity_belonging_worship.png";
import hearingImg from "@assets/generated_images/day_5_peaceful_reflection_morning.png";
import worshipImg from "@assets/generated_images/outdoor_acoustic_worship_session.png";
import prayerImg from "@assets/generated_images/day_8_prayer_warfare_strength.png";
import collectiveImg from "@assets/generated_images/day_13_collective_prayer_warfare.png";

import { navigateToApp } from "@/lib/domain";

export default function TheOutpouring() {
  const [, navigate] = useLocation();
  const go = (path: string) => navigateToApp(path, navigate);

  const teachings = [
    {
      icon: Flame,
      title: "Who is the Holy Spirit?",
      description:
        "Discover the person and nature of the Holy Spirit — not just a force, but the living God who dwells within every believer. Learn how He reveals Christ, convicts of sin, and empowers us for Kingdom living.",
      gradient: "from-blue-600 to-indigo-700",
      image: spiritImg,
    },
    {
      icon: BookOpen,
      title: "Baptism of the Holy Spirit",
      description:
        "Explore what it means to be baptised in the Holy Spirit as described in Acts 2. Understand the gifts of the Spirit, speaking in tongues, and the supernatural power available to every believer.",
      gradient: "from-purple-600 to-violet-700",
      image: baptismImg,
    },
    {
      icon: Ear,
      title: "Hearing the Voice of the Spirit",
      description:
        "Learn to recognise and respond to the voice of the Holy Spirit in your daily life. Through prayer, Scripture, and sensitivity to His leading, develop a deeper communion with God.",
      gradient: "from-emerald-600 to-teal-700",
      image: hearingImg,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      <SEO
        title="The Outpouring - Holy Spirit Teachings | The Reawakened One"
        description="Understanding, experiencing, and walking daily with the Holy Spirit. Explore teachings on the Holy Spirit, baptism of the Spirit, and hearing God's voice."
      />
      <Navbar />

      {/* Hero — full-bleed image */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#14273d]/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-32 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto mb-8 shadow-2xl ring-4 ring-white/10">
              <CloudRain className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-6 drop-shadow-lg">
              The Outpouring
            </h1>
            <p className="text-sm font-semibold text-blue-300 tracking-widest uppercase mb-4">
              Joel Chapter 2
            </p>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              The fire of the Spirit that revives hearts and sets us ablaze with
              purpose. Understanding, experiencing, and walking daily with the
              Holy Spirit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction with side image */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
                Encounter the Holy Spirit
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                The Holy Spirit is God's presence active in the world and in our
                lives. He is our Comforter, Teacher, and Guide — the One who
                empowers us to live out our calling and walk in the fullness of
                what God has for us.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Through the Outpouring, we explore what it means to be filled,
                led, and transformed by the Spirit.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={prayerImg}
                  alt="Prayer and spiritual encounter"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl opacity-20 blur-xl" />
            </motion.div>
          </div>

          {/* Teaching cards with images */}
          <div className="grid md:grid-cols-3 gap-8">
            {teachings.map((teaching, index) => (
              <motion.div
                key={teaching.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={teaching.image}
                    alt={teaching.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div
                    className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${teaching.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <teaching.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                    {teaching.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {teaching.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture Section — with background image */}
      <section className="relative py-24 overflow-hidden">
        <img
          src={collectiveImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14273d]/95 to-[#14273d]/85" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-1 h-12 bg-blue-400 mx-auto mb-8 rounded-full" />
            <blockquote className="text-2xl md:text-3xl font-display font-bold text-white leading-relaxed mb-6 italic">
              "And it shall come to pass afterward, that I will pour out my
              Spirit on all flesh; your sons and your daughters shall prophesy,
              your old men shall dream dreams, and your young men shall see
              visions."
            </blockquote>
            <p className="text-lg font-semibold text-blue-300">— Joel 2:28</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section — with worship background */}
      <section className="relative py-24 overflow-hidden">
        <img
          src={worshipImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#046bd2]/90 to-[#045cb4]/85" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Ready to Experience the Outpouring?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Join our community of believers pursuing a deeper encounter with
              the Holy Spirit through daily devotionals, prayer, and Spirit-led
              teaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => go("/register")}
                className="bg-white text-[#046bd2] hover:bg-gray-100 font-bold px-10 py-6 rounded-full text-lg shadow-2xl hover:scale-105 transition-all"
              >
                Join Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                onClick={() => go("/sparks")}
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-10 py-6 rounded-full text-lg"
              >
                Explore Daily Sparks
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-[#14273d] via-[#14273d] to-[#1a3050] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] " />
        </div>
        <div className="max-w-md mx-auto px-4 relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              Stay Connected
            </h2>
            <p className="text-sm text-white/80">
              Receive teachings, prayer points, and updates on the Outpouring
            </p>
          </div>
          <SubscriptionCapture
            variant="card"
            title="Join Our Community"
            subtitle="Get Spirit-led teachings and prayer updates delivered to your inbox."
            showCategories={false}
            showWhatsApp={false}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
