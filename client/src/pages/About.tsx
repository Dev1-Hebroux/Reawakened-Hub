import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Flame, Globe2, Heart, Users, MapPin, 
  BookOpen, ArrowRight, Waves, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

import mapImg from "@assets/generated_images/digital_map_of_the_world_with_glowing_connections.png";
import prayerImg from "@assets/generated_images/young_woman_speaking_passionately_into_camera.png";
import worshipImg from "@assets/generated_images/young_man_praying_with_golden_light_overlay.png";

const pillars = [
  {
    title: "The Outpouring",
    scripture: "Joel Chapter 2",
    verse: "I will pour out my Spirit upon all flesh...",
    icon: Waves,
    description: "Hearts incubated by the Holy Spirit, where Grace and empathy transcend cultural and geographic barriers.",
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "The Harvest",
    scripture: "John Chapter 4",
    verse: "Lift up your eyes, and look on the fields; for they are white already to harvest.",
    icon: Target,
    description: "Possessing our inheritance and harvesting the nations through mission and outreach.",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Without Walls",
    scripture: "Zechariah Chapter 2",
    verse: "Jerusalem shall be inhabited as towns without walls...",
    icon: Globe2,
    description: "A movement that transcends boundaries, walls, and limitations to reach every nation.",
    color: "from-emerald-500 to-teal-600"
  }
];

const visionCards = [
  {
    title: "Global Awakening",
    description: "We aspire to be at the forefront of a global awakening, where the watchmen and gatekeepers of our faith stand tall against the tides of change.",
    icon: Globe2,
    image: mapImg
  },
  {
    title: "Revival Prayers",
    description: "Hearts incubated by the Holy Spirit, as exemplified in John 4:1-48, where Grace and empathy transcend cultural and geographic barriers.",
    icon: Flame,
    image: prayerImg
  },
  {
    title: "Empowerment",
    description: "Empower and inspire one another, fostering a generation of leaders and believers who are equipped to navigate the complexities of this era with faith as their compass.",
    icon: Heart,
    image: worshipImg
  }
];

const coreValues = [
  {
    icon: BookOpen,
    title: "Worship & Prayers",
    description: "A passionate desire to become a devoted people who call on His name with open heart"
  },
  {
    icon: Users,
    title: "Community",
    description: "A community of believers hungry for diverse manifestation of His Kingdom"
  },
  {
    icon: MapPin,
    title: "Mission & Outreach",
    description: "Possessing our inheritance and Harvesting the Nations"
  }
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-foreground overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-orange-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <Flame className="h-5 w-5 text-orange-300 animate-pulse" />
              <span className="font-bold text-white uppercase tracking-wider">A Call to Vigilance, Revival & Spiritual Awakening</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-8">
              The Movement
            </h1>

            <blockquote className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8 italic">
              "I will pour out my Spirit upon all of you! Your sons and daughters will prophesy; your old men will dream dreams, and your young men see visions."
            </blockquote>
            <p className="text-orange-200 font-bold text-lg">— Joel 2:28</p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-full px-10 h-16 text-lg font-bold shadow-xl w-full sm:w-auto">
                Join The Movement
              </Button>
              <Link href="/community">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-10 h-16 text-lg font-bold w-full sm:w-auto">
                  Enter Community
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Embrace the Boundaryless Journey */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 italic">
                Embrace the Boundaryless Journey
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                We invite you to be part of a transformative mission, a journey that transcends walls and boundaries.
              </p>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Our vision is not just an organization; it's a movement, a vibrant community of watchmen and gatekeepers committed to spiritual awakening and revival across The United Kingdom, Europe, The Americas, The Middle East, Africa, and Asia.
              </p>
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 font-bold text-lg">
                Join The Movement <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-primary rounded-[30px] p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                <div className="relative z-10 text-center">
                  <h3 className="text-2xl font-display font-bold mb-2">THE</h3>
                  <h2 className="text-4xl font-display font-bold mb-2">.reawak:ned.</h2>
                  <h3 className="text-xl font-display tracking-widest">ONE</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Our Foundation</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Three Scriptural Pillars
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Grounded in Scripture, empowered by the Spirit, united in mission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-[30px] p-8 shadow-lg border border-gray-100 h-full hover:shadow-xl transition-shadow">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6`}>
                    <pillar.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{pillar.title}</h3>
                  <p className="text-primary font-bold text-sm mb-4">{pillar.scripture}</p>
                  <p className="text-gray-500 italic text-sm mb-4">"{pillar.verse}"</p>
                  <p className="text-gray-600">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Our Vision
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Be a lighthouse in the global crossroads, guiding young and mature youths across Europe, America, the Middle East, Africa and Asia, towards a spiritual renaissance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {visionCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-[30px] overflow-hidden shadow-lg border border-gray-100 h-full">
                  <div className="h-48 overflow-hidden">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-display font-bold text-gray-900 mb-4">{card.title}</h3>
                    <p className="text-gray-500 mb-6">{card.description}</p>
                    <button className="inline-flex items-center gap-2 bg-gray-100 text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Raising a Standard */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-[30px] overflow-hidden shadow-2xl">
                <img src={mapImg} alt="Global Mission" className="w-full h-[500px] object-cover" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Raising a Standard & Building Without Walls
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Awakened to a great outpouring of the love of God, revival, harvest of Souls, Miracles, signs and wonders all over the Nations of the world.
              </p>

              <div className="space-y-6">
                {coreValues.map((value, i) => (
                  <div key={value.title} className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{value.title}</h4>
                      <p className="text-gray-500">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Join The Movement CTA */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Join The Movement
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Share your passion and God's amazing works in your community. Be part of a generation rising for revival and spiritual awakening.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-full px-10 h-16 text-lg font-bold shadow-xl w-full sm:w-auto">
                Get Started Today
              </Button>
              <Link href="/community">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-10 h-16 text-lg font-bold w-full sm:w-auto">
                  Contact Us
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
