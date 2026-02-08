import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionCapture } from "@/components/sections/SubscriptionCapture";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  CloudRain, Globe, Landmark, ArrowRight,
  Lightbulb, Users, Rocket, ChevronRight, Zap, Target, BookOpen, Heart, MapPin
} from "lucide-react";

import logoDark from "@assets/Reawakened_278_141_logo_bigger_1767192125280.png";

// Hero & section background images
import heroImg from "@assets/generated_images/concert_crowd_with_hands_raised_in_worship.png";
import sunriseImg from "@assets/generated_images/cinematic_sunrise_devotional_background.png";

// Three Pillars images
import prayerImg from "@assets/generated_images/young_man_praying_with_golden_light_overlay.png";
import harvestImg from "@assets/generated_images/day_21_harvest_multiplication_vision.png";
import globalMapImg from "@assets/generated_images/digital_map_of_the_world_with_glowing_connections.png";

// Vision section images
import globeImg from "@assets/generated_images/hands_holding_a_glowing_digital_globe.png";
import worshipImg from "@assets/generated_images/outdoor_acoustic_worship_session.png";
import youthImg from "@assets/generated_images/young_people_at_a_coffee_shop_bible_study.png";

// Raising a Standard images
import outreachEventImg from "@assets/generated_images/group_wearing_reawakened.one_branded_t-shirts.jpg";

// Boundaryless CTA images
import missionImg from "@assets/generated_images/global_mission_map_concept.png";

// Aspirations background
import communityImg from "@assets/generated_images/diverse_group_taking_a_selfie.png";
import backpackerImg from "@assets/generated_images/backpacker_overlooking_a_landscape.png";

import { navigateToApp } from "@/lib/domain";

export default function MarketingHome() {
  const [, navigate] = useLocation();
  const go = (path: string) => navigateToApp(path, navigate);

  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      <SEO
        title="The Reawakened One - A Call to Vigilance, Revival & Spiritual Awakening"
        description="Be a lighthouse in the global crossroads, guiding youths across Europe, America, the Middle East, Africa and Asia towards a spiritual renaissance."
      />
      <Navbar />

      {/* Hero Section - Full-bleed background image */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b2e]/80 via-[#14273d]/70 to-[#1a3050]/85" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={logoDark}
              alt="The Reawakened One"
              className="h-16 md:h-20 mx-auto mb-8 opacity-90"
            />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              A Call to Vigilance,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Revival
              </span>{" "}
              & Spiritual Awakening!
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
              Be a lighthouse in the global crossroads, guiding youths across Europe, America, the Middle East, Africa and Asia, towards a spiritual renaissance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => go("/register")}
                className="bg-white text-[#14273d] hover:bg-gray-100 font-bold px-10 py-6 rounded-full text-lg shadow-2xl hover:scale-105 transition-all"
              >
                Join Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                onClick={() => navigate("/about")}
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-bold px-10 py-6 rounded-full text-lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Three Pillars Section - Image cards */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#046bd2] font-bold tracking-widest uppercase text-sm mb-3 block">Our Foundation</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900">
              Three Pillars of Revival
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CloudRain,
                title: "The Outpouring",
                reference: "Joel Chapter 2",
                description: "The fire of the Spirit that revives hearts and sets us ablaze with purpose. Understanding, experiencing, and walking daily with the Holy Spirit.",
                link: "/the-outpouring",
                gradient: "from-blue-600 to-indigo-700",
                image: prayerImg,
              },
              {
                icon: Globe,
                title: "The Harvest",
                reference: "John Chapter 4",
                description: "Hearts incubated by the Holy Spirit, where Grace and empathy transcend cultural and geographic barriers. Harvesting souls across nations.",
                link: "/sparks",
                gradient: "from-emerald-600 to-teal-700",
                image: harvestImg,
              },
              {
                icon: Landmark,
                title: "Without Walls",
                reference: "Zechariah Chapter 2",
                description: "A vibrant community of watchmen committed to spiritual awakening that transcends boundaries across the UK, Europe, Americas, and beyond.",
                link: "/community",
                gradient: "from-amber-600 to-orange-700",
                image: globalMapImg,
              },
            ].map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                onClick={() => navigate(pillar.link)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center shadow-lg`}>
                    <pillar.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{pillar.title}</h3>
                  <p className="text-sm font-semibold text-[#046bd2] mb-3">{pillar.reference}</p>
                  <p className="text-gray-600 leading-relaxed mb-4">{pillar.description}</p>
                  <span className="inline-flex items-center gap-2 text-[#046bd2] font-bold group-hover:gap-3 transition-all">
                    Explore <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section - With side image */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#046bd2] font-bold tracking-widest uppercase text-sm mb-3 block">Our Purpose</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Be a lighthouse in the global crossroads, guiding young and mature youths across Europe, America,
                the Middle East, Africa and Asia, towards a spiritual renaissance.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={sunriseImg}
                alt="Vision - Spiritual Renaissance"
                className="w-full h-[300px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#14273d]/30 to-transparent" />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Global Awakening",
                description: "We aspire to be at the forefront of a global awakening, where the watchmen and gatekeepers of our faith stand tall against the tides of change.",
                icon: Globe,
                color: "bg-blue-50 text-blue-700",
                image: globeImg,
              },
              {
                title: "Revival Prayers",
                description: "Hearts incubated by the Holy Spirit, as exemplified in John 4:1-48, where Grace and empathy transcend cultural and geographic barriers.",
                icon: Zap,
                color: "bg-emerald-50 text-emerald-700",
                image: worshipImg,
              },
              {
                title: "Empowerment",
                description: "Empower and inspire one another, fostering a generation of leaders and believers equipped to navigate complexities with faith as compass.",
                icon: Rocket,
                color: "bg-amber-50 text-amber-700",
                image: youthImg,
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 -mt-10 relative z-10 shadow-lg border-4 border-white`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{item.description}</p>
                  <Link href="/about">
                    <span className="text-[#046bd2] font-bold text-sm hover:underline cursor-pointer">Learn More &rarr;</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Raising a Standard Section - With background image */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <img
          src={outreachEventImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#14273d]/85" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIGN4PSIyMCIgY3k9IjIwIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Raising a Standard & Building Without Walls
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Awakened to a great outpouring of the love of God, revival, harvest of Souls,
              Miracles, signs and wonders all over the Nations of the world.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "Worship & Prayers",
                description: "Devoted people who call on His name with open heart",
              },
              {
                icon: Users,
                title: "Community",
                description: "Believers hungry for diverse manifestation of His Kingdom",
              },
              {
                icon: Rocket,
                title: "Mission & Outreach",
                description: "Possessing our inheritance and Harvesting the Nations",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Boundaryless Journey CTA - With background image */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <img
          src={missionImg}
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
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Embrace the Boundaryless Journey
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
              We invite you to be part of a transformative mission that transcends walls and boundaries.
              A vibrant community of watchmen committed to spiritual awakening across the UK, Europe,
              Americas, Middle East, Africa, and Asia.
            </p>
            <Button
              onClick={() => go("/outreach")}
              className="bg-white text-[#046bd2] hover:bg-gray-100 font-bold px-10 py-6 rounded-full text-lg shadow-2xl hover:scale-105 transition-all"
            >
              Join The Movement
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Our Aspirations - Stats & Targets */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#046bd2] font-bold tracking-widest uppercase text-sm mb-3 block">Our Aspirations</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Encounter. Equip. Mobilise.
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                We exist to reach young people aged 15–35 across the globe — non-Christians, seekers,
                those losing their faith, and believers going cold.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Through digital tools and real-world community, we're creating pathways
                to discover Jesus, grow in faith, and become agents of transformation.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={backpackerImg}
                alt="Journey of faith"
                className="w-full h-[320px] object-cover rounded-3xl shadow-2xl"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#14273d]/20 to-transparent" />
            </motion.div>
          </div>

          {/* Target Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { value: "5,000+", label: "Disciples by 2030", icon: Target, color: "from-blue-600 to-indigo-700" },
              { value: "50+", label: "Nations Reached", icon: MapPin, color: "from-emerald-600 to-teal-700" },
              { value: "365", label: "Daily Sparks / Year", icon: BookOpen, color: "from-amber-600 to-orange-700" },
              { value: "100+", label: "Campus Movements", icon: Heart, color: "from-rose-600 to-pink-700" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Three Channels */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Encounter",
                description: "Daily devotionals, prayer campaigns, and digital content designed to meet people where they are spiritually.",
                gradient: "from-blue-600 to-indigo-700",
                image: communityImg,
              },
              {
                icon: BookOpen,
                title: "Equip",
                description: "Vision pathways, Bible reading plans, growth tools, and discipleship journeys that build strong foundations.",
                gradient: "from-emerald-600 to-teal-700",
                image: worshipImg,
              },
              {
                icon: Rocket,
                title: "Mobilise",
                description: "Mission training, outreach opportunities, and community engagement that turns believers into world-changers.",
                gradient: "from-amber-600 to-orange-700",
                image: youthImg,
              },
            ].map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={channel.image}
                    alt={channel.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${channel.gradient} flex items-center justify-center shadow-lg`}>
                    <channel.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{channel.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{channel.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Share CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">
              Share your passion and God's amazing works in your community
            </h2>
            <Button
              onClick={() => navigate("/about")}
              variant="outline"
              className="border-2 border-[#14273d] text-[#14273d] hover:bg-[#14273d] hover:text-white font-bold px-8 py-5 rounded-full"
            >
              Contact Us
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] " />
        </div>
        <div className="max-w-md mx-auto px-4 relative z-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              Join Our Newsletter
            </h2>
            <p className="text-sm text-white/80">
              Free updates on Newsletter, Events and Resources
            </p>
          </div>
          <SubscriptionCapture
            variant="card"
            title="Stay Ignited"
            subtitle="Get daily sparks, mission updates, and prayer points delivered to your inbox."
            showCategories={false}
            showWhatsApp={false}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
