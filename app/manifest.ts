import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dịch Lý Việt Nam',
    short_name: 'Dịch Lý',
    description: 'Lịch âm dương, xem quẻ Kinh Dịch theo giờ, bốc quẻ bài Tây',
    start_url: '/xem-que',
    display: 'standalone',
    background_color: '#0c0c14',
    theme_color: '#0c0c14',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
