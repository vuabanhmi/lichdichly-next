import type { Metadata } from 'next'
import DichLyApp from './DichLyApp'

export const metadata: Metadata = {
  title: 'Xem Quẻ Theo Giờ & Bốc Quẻ',
}

export default function XemQuePage() {
  return <DichLyApp />
}
