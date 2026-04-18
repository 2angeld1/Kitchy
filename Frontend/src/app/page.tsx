'use client'

import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { Demos } from '@/components/landing/Demos'
import { Verticals } from '@/components/landing/Verticals'
import { CaitlynAI } from '@/components/landing/CaitlynAI'
import { RadarPanama } from '@/components/landing/RadarPanama'
import { Features } from '@/components/landing/Features'
import { Founder } from '@/components/landing/Founder'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-rose-600 selection:text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <Demos />
      <Verticals />
      <CaitlynAI />
      <RadarPanama />
      <Features />
      <Founder />
      <Footer />
    </main>
  )
}
