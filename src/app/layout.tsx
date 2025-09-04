import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Snake Game - Classic Arcade Game',
  description: 'Play the classic Snake game in your browser. Use arrow keys or WASD to control the snake and eat food to grow longer.',
  keywords: ['snake game', 'arcade game', 'retro game', 'browser game'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}