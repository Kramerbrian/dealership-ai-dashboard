'use client'

import { motion } from 'framer-motion'
import { 
  Search, 
  BarChart3, 
  Shield, 
  Zap,
  Target,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: "AI Visibility Score",
    description: "See exactly how visible your dealership is across ChatGPT, Claude, and Perplexity",
    color: "blue"
  },
  {
    icon: BarChart3,
    title: "Competitor Analysis",
    description: "Compare your AI presence against local competitors with detailed breakdowns",
    color: "green"
  },
  {
    icon: Shield,
    title: "Review Health Check",
    description: "Analyze your review profile and identify opportunities to improve trust signals",
    color: "purple"
  },
  {
    icon: Zap,
    title: "Schema Optimization",
    description: "Fix missing or incorrect structured data that AI uses to understand your business",
    color: "yellow"
  }
]

const comingSoon = [
  {
    icon: Target,
    title: "AI Citation Tracking",
    description: "Monitor when and how AI platforms mention your dealership",
    status: "Coming Soon"
  },
  {
    icon: TrendingUp,
    title: "Revenue Impact Calculator",
    description: "See exactly how much revenue you're losing to poor AI visibility",
    status: "Coming Soon"
  },
  {
    icon: Users,
    title: "Customer Journey Mapping",
    description: "Track how customers discover your dealership through AI interactions",
    status: "Coming Soon"
  },
  {
    icon: Clock,
    title: "Real-time Monitoring",
    description: "Get alerts when your AI visibility changes or competitors gain ground",
    status: "Coming Soon"
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Current Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Everything You Need to Dominate AI Search
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Our platform analyzes your dealership's AI visibility across all major platforms and gives you actionable insights to improve.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 h-full">
                <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Coming Soon
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We're constantly adding new features to help you stay ahead of the AI revolution.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {comingSoon.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700/30 hover:border-gray-600/30 transition-all duration-300 h-full relative overflow-hidden">
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                    {feature.status}
                  </span>
                </div>
                
                <div className="w-12 h-12 bg-gray-600/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
