'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'

const impactOptions = ['HIGH', 'MEDIUM', 'LOW'] as const

type ImpactOption = (typeof impactOptions)[number]

export function SignalIngestionPanel() {
  const { user, loading, getIdToken } = useAuth()
  const [source, setSource] = useState('webhook')
  const [title, setTitle] = useState('New signal detected')
  const [description, setDescription] = useState('Incoming signal data requires review.')
  const [impact, setImpact] = useState<ImpactOption>('MEDIUM')
  const [metric, setMetric] = useState('0.00')
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => !!user && source.trim().length > 0 && title.trim().length > 0,
    [user, source, title]
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!canSubmit) {
      setStatus('Please sign in and complete the required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('Unable to retrieve auth token')
      }

      const payload = {
        title,
        description,
        impact,
        metric: Number(metric) || 0,
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ source, payload }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Failed to submit signal event')
      }

      setStatus('Signal submitted successfully. Processing will begin shortly.')
      setTitle('')
      setDescription('')
      setMetric('0.00')
      setImpact('MEDIUM')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error submitting signal')
      console.error('[SignalIngestionPanel] submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass rounded-3xl border border-white/10 p-6"
    >
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/80">Signal Ingestion</p>
          <h2 className="text-2xl font-semibold text-foreground">Submit a live event</h2>
        </div>
        <p className="max-w-xl text-sm text-foreground/60">
          Create a new signal event and push it into the SignalX pipeline for AI analysis and alert generation.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white/5 p-8 text-center text-foreground/60">Checking auth status...</div>
      ) : !user ? (
        <div className="rounded-3xl bg-white/5 p-8 text-center text-foreground/60">
          Sign in to submit events and power the realtime decision engine.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-foreground/70">
              Source
              <input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
                placeholder="e.g. webhook, sensor, api"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-foreground/70">
              Impact
              <select
                value={impact}
                onChange={(event) => setImpact(event.target.value as ImpactOption)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
              >
                {impactOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm text-foreground/70">
            Event Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
              placeholder="Enter a signal title"
              required
            />
          </label>

          <label className="space-y-2 text-sm text-foreground/70">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full min-h-[120px] rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
              placeholder="Describe the incoming data or anomaly"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-foreground/70">
              Metric
              <input
                value={metric}
                onChange={(event) => setMetric(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
                placeholder="e.g. 87.1"
                inputMode="decimal"
              />
            </label>
            <div className="space-y-2 text-sm text-foreground/70">
              <span>User</span>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground">
                {user.email ?? user.uid}
              </div>
            </div>
          </div>

          {status && (
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-foreground/80">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
          >
            {isSubmitting ? 'Submitting event…' : 'Submit signal event'}
          </button>
        </form>
      )}
    </motion.section>
  )
}
