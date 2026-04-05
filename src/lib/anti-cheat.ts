'use client'
import { useEffect, useRef, useCallback } from 'react'

interface AntiCheatOptions {
  participantId: string
  maxViolations: number
  onViolation: (count: number) => void
  onAutoSubmit: () => void
}

export function useAntiCheat({ participantId, maxViolations, onViolation, onAutoSubmit }: AntiCheatOptions) {
  const violationCount = useRef(0)

  const logViolation = useCallback(async (type: string) => {
    violationCount.current += 1
    await fetch('/api/violations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, type }),
    })
    onViolation(violationCount.current)
    if (violationCount.current >= maxViolations) {
      onAutoSubmit()
    }
  }, [participantId, maxViolations, onViolation, onAutoSubmit])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) logViolation('tab_switch')
    }
    const handleBlur = () => logViolation('window_blur')
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && ['c', 'v', 'u', 'a', 'p'].includes(e.key.toLowerCase())) e.preventDefault()
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) e.preventDefault()
      if (e.key === 'PrintScreen') e.preventDefault()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [logViolation])

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }

  return { violationCount: violationCount.current, enterFullscreen }
}
