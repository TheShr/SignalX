'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'

const impactOptions = ['HIGH', 'MEDIUM', 'LOW'] as const

type ImpactOption = (typeof impactOptions)[number]

export function SignalIngestionPanel() {
  const { user, loading, getIdToken } = useAuth()
  const [source, setSource] = useState('open-meteo')
  const [locationName, setLocationName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [title, setTitle] = useState('Local flood risk analysis')
  const [description, setDescription] = useState('Fetch weather for your current location and generate a risk recommendation.')
  const [impact, setImpact] = useState<ImpactOption>('MEDIUM')
  const [status, setStatus] = useState<string | null>(null)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => !!user && source.trim().length > 0 && latitude.trim().length > 0 && longitude.trim().length > 0,
    [user, source, latitude, longitude]
  )

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not available in your browser.')
      return
    }

    setLocationStatus('Detecting your location…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude.toFixed(5)))
        setLongitude(String(position.coords.longitude.toFixed(5)))
        setLocationStatus('Location detected successfully.')
      },
      (error) => {
        console.error('[SignalIngestionPanel] geolocation error:', error)
        setLocationStatus('Unable to detect location. Please enter coordinates manually.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)

    if (!canSubmit) {
      setStatus('Please sign in and provide latitude and longitude.')
      return
    }

    if (!user) {
      throw new Error('No authenticated user found')
    }

    setIsSubmitting(true)

    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error('Unable to retrieve auth token')
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          source,
          locationName: locationName || undefined,
          latitude: Number(latitude),
          longitude: Number(longitude),
          payload: {
            title,
            description,
            impact,
          },
          userEmail: user.email ?? undefined,
          userId: user.uid,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to submit signal event')
      }

      const sentSignal = result.signal ?? result.event
      if (sentSignal && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('signalx:new-event', {
            detail: sentSignal,
          })
        )
      }

      setStatus('Signal submitted successfully. Live decision data is now updating.')
      setTitle('Local flood risk analysis')
      setDescription('Fetch weather for your current location and generate a risk recommendation.')
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
          <div className="rounded-3xl border border-cyan-400/10 bg-white/5 p-4 text-sm text-foreground/70">
            Logged in as: {user.email ? (
              <a href={`mailto:${user.email}`} className="text-cyan-300 hover:text-cyan-200 underline">
                {user.email}
              </a>
            ) : (
              <span>{user.uid}</span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-foreground/70">
              Source
              <input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
                placeholder="e.g. open-meteo"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-foreground/70">
              Location label
              <input
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
                placeholder="City, neighborhood or region"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-foreground/70">
              Latitude
              <input
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
                placeholder="e.g. 37.7749"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-foreground/70">
              Longitude
              <input
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
                placeholder="e.g. -122.4194"
                required
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            className="inline-flex items-center justify-center rounded-3xl bg-white/5 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-white/10"
          >
            Detect my location
          </button>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-foreground/70">
              Event Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
                placeholder="Flood risk analysis"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-foreground/70">
              Expected risk
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
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full min-h-[120px] rounded-3xl border border-white/10 bg-transparent px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-400/60"
              placeholder="Describe the local weather or signal context"
            />
          </label>

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
            {isSubmitting ? 'Submitting signal…' : 'Run flood risk check'}
          </button>
        </form>
      )}
    </motion.section>
  )
}
