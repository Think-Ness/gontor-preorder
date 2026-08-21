'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CountdownTimerProps {
  endDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculate = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now()
    if (diff <= 0) {
      setIsExpired(true)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    setTimeLeft({ days, hours, minutes, seconds })
  }, [endDate])

  useEffect(() => {
    calculate()
    intervalRef.current = setInterval(calculate, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [calculate])

  if (isExpired) return null

  const units = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-4">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-1.5 sm:gap-4">
          <div className="text-center">
            <div
              className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl sm:rounded-2xl shadow-lg border border-emerald-800"
              style={{
                background: 'linear-gradient(135deg, #063D2E, #0d6041)',
                color: 'white',
              }}
            >
              <span className="font-display font-black text-2xl sm:text-4xl tabular-nums drop-shadow-md">
                {pad(value)}
              </span>
            </div>
            <div className="text-emerald-800 text-[10px] sm:text-xs font-display font-bold mt-1.5 sm:mt-2 tracking-widest uppercase">
              {label}
            </div>
          </div>
          {i < units.length - 1 && (
            <span className="font-display font-black text-amber-500 mb-5 text-xl sm:text-3xl">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
