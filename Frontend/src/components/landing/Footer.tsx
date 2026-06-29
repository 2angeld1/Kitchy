'use client'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export const Footer = () => (
  <footer className="py-24 border-t border-zinc-900 bg-black/50 overflow-hidden">
    <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-24">
      <div className="max-w-xs">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
            <Image
              src="/vesta-logo.png"
              alt="Vesta Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-3xl font-black tracking-tighter text-white uppercase italic">VESTA</span>
        </div>
        <p className="text-zinc-500 font-medium leading-relaxed">
          La plataforma definitiva para escalar tu negocio en Panamá. Inteligencia real para dueños que no quieren perder dinero.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-16">
        <div>
          <h5 className="text-white font-black text-xs uppercase mb-8 tracking-[4px]">Producto</h5>
          <div className="flex flex-col gap-5 text-zinc-500 text-sm font-bold tracking-widest uppercase">
            <a href="#inicio" className="hover:text-emerald-500">Gastronomía</a>
            <a href="#inicio" className="hover:text-emerald-500">Salud & Belleza</a>
            <a href="#caitlyn" className="hover:text-emerald-500">Caitlyn AI</a>
            <a href="#founder" className="hover:text-emerald-500">El Creador</a>
          </div>
        </div>
        <div>
          <h5 className="text-white font-black text-xs uppercase mb-8 tracking-[4px]">Legal</h5>
          <div className="flex flex-col gap-5 text-zinc-500 text-sm font-bold tracking-widest uppercase">
            <a href="/legal/terms" className="hover:text-emerald-500">Términos</a>
            <a href="/legal/privacy" className="hover:text-emerald-500">Privacidad</a>
            <a href="/legal/eula" className="hover:text-emerald-500">Licencia EULA</a>
          </div>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <h5 className="text-white font-black text-xs uppercase mb-8 tracking-[4px]">Suscríbete</h5>
          <div className="relative">
            <input
              type="email"
              placeholder="CEO@TUEMPRESA.COM"
              className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-xs w-full focus:outline-none focus:border-emerald-500 transition-all text-white font-bold"
            />
            <button className="absolute right-3 top-3 bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-6 mt-24 pt-10 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
      <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[4px]">© 2026 VESTA BY GOSEN TECH — PANAMÁ. ALL RIGHTS RESERVED.</p>
    </div>
  </footer>
)
