'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { AlertCircle } from 'lucide-react'
import { GradientBackground } from '@/components/animations/gradient-background'

export default function RegisterPage() {
  const router = useRouter()
  const { loginWithGoogle, user, loading } = useAuth()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  if (!loading && user) {
    router.push('/dashboard')
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <GradientBackground />

      <motion.div
        className="w-full max-w-md z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">Σ</span>
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mt-4">SignalX</h1>
          <p className="text-foreground/60 mt-2">Join the AI Revolution</p>
        </div>

        {/* Form Card */}
        <motion.div
          className="glass rounded-2xl p-8 backdrop-blur-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Create Account</h2>

          <motion.button
            type="button"
            onClick={async () => {
              setError('')
              setIsLoading(true)
              try {
                await loginWithGoogle()
                router.push('/dashboard')
              } catch (err: any) {
                setError(err.message || 'Google sign-up failed')
              } finally {
                setIsLoading(false)
              }
            }}
            className="w-full mb-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white/20"
          >
            Continue with Google
          </motion.button>

          {error && (
            <motion.div
              className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm flex items-start gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="rounded-3xl bg-white/5 p-4 text-sm text-foreground/70 border border-white/10">
              <p className="font-semibold text-foreground/80">Secure onboarding with Google.</p>
              <p className="mt-2">SignalX captures your email from Firebase automatically and attaches it to every signal.</p>
            </div>

            <motion.button
              type="button"
              onClick={async () => {
                setError('')
                setIsLoading(true)
                try {
                  await loginWithGoogle()
                  router.push('/dashboard')
                } catch (err: any) {
                  setError(err.message || 'Google sign-up failed')
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Signing up…' : 'Continue with Google'}
            </motion.button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-foreground/40">Already have an account?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Sign In Link */}
          <Link href="/auth/login">
            <motion.button
              type="button"
              className="w-full px-4 py-3 rounded-lg border border-white/20 text-foreground font-semibold hover:bg-white/5 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
