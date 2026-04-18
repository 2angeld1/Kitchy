'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-white/5">
            <Image 
              src="/logo-realistic-rbg.png" 
              alt="Kitchy Logo" 
              width={24} 
              height={24} 
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">KITCHY</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-[4px] text-zinc-400">
          <a href="#inicio" className="hover:text-rose-500 transition-colors">Inicio</a>
          <a href="#demos" className="hover:text-rose-500 transition-colors">Demos</a>
          <a href="#caitlyn" className="hover:text-rose-500 transition-colors">Caitlyn AI</a>
          <a href="#radar" className="hover:text-rose-500 transition-colors">Radar</a>
          <a href="#founder" className="hover:text-rose-500 transition-colors">Creador</a>
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl shadow-lg shadow-rose-900/40 transition-all active:scale-95 glow-primary">
            ABRIR APP
          </button>
        </div>
      </div>
    </nav>
  )
}
