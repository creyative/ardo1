'use client'
import { useEffect } from 'react'

export function FaviconManager() {
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.favicon_url) {
          const rels = ['icon', 'shortcut icon', 'apple-touch-icon', 'mask-icon']
          rels.forEach(rel => {
            let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null
            if (!link) {
              link = document.createElement('link')
              link.rel = rel
              if (rel === 'icon') link.type = 'image/png'
              if (rel === 'mask-icon') link.setAttribute('color', '#2563eb')
              document.head.appendChild(link)
            }
            link.href = data.favicon_url
          })
        }
      })
      .catch(err => console.error('Failed to load favicon:', err))
  }, [])

  return null
}
