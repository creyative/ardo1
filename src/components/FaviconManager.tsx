'use client'
import { useEffect } from 'react'

export function FaviconManager() {
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.favicon_url) {
          let link = document.querySelector("link[rel='icon']") as HTMLLinkElement
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = data.favicon_url
        }
      })
      .catch(err => console.error('Failed to load favicon:', err))
  }, [])

  return null
}
