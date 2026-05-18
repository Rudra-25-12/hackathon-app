import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'AtomQuest Portal — Goal Setting & Tracking',
  description: 'In-house goal setting and tracking portal powered by Atomberg',
  icons: { icon: '/atomquest-logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  )
}