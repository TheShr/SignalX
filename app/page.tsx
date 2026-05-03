'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { GradientBackground } from '@/components/animations/gradient-background'
import { FloatingParticles } from '@/components/animations/floating-particles'
import { ArrowRight, Sparkles, TrendingUp, AlertCircle, Zap } from 'lucide-react'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Intelligence',
      description: 'Process data streams instantly and uncover patterns at scale',
    },
    {
      icon: Zap,
      title: 'AI-Powered Insights',
      description: 'Get actionable recommendations powered by advanced algorithms',
    },
    {
      icon: AlertCircle,
      title: 'Intelligent Alerts',
      description: 'Stay informed with context-aware notifications and priority system',
    },
  ]

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <GradientBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="absolute inset-0 w-full h-full opacity-30">
          <FloatingParticles />
        </div>

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 backdrop-blur-sm">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm text-cyan-300">Introducing SignalX v2.0</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Turn Real-Time Data Into Intelligent Decisions
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-foreground/60 mb-8 leading-relaxed"
          >
            SignalX uses advanced AI to process real-time data streams, detect patterns, and deliver actionable insights
            at the speed of business.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/dashboard">
              <motion.button
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-background font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-400/50 transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Launch Dashboard
                <ArrowRight size={18} />
              </motion.button>
            </Link>

            <motion.button
              className="px-8 py-3 rounded-lg border border-white/20 text-foreground font-semibold hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '<100ms', label: 'Latency' },
              { value: '10B+', label: 'Events/day' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-sm text-foreground/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why SignalX</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Built for teams that need to make decisions faster than the market moves
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass rounded-xl p-8 border border-white/10 hover:border-cyan-400/50 transition-colors group"
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 inline-block p-3 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-400/20 group-hover:from-cyan-400/40 group-hover:to-purple-400/40 transition-colors">
                  <feature.icon className="text-cyan-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground/60">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass rounded-xl p-12 border border-white/10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to decide faster?</h2>
            <p className="text-lg text-foreground/60 mb-8">
              Join thousands of teams using SignalX to make better decisions in real-time.
            </p>
            <Link href="/dashboard">
              <motion.button
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-background font-semibold flex items-center gap-2 mx-auto hover:shadow-lg hover:shadow-cyan-400/50 transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/50">
          <p>&copy; 2024 SignalX. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
