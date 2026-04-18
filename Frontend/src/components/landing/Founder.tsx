'use client'
import { motion } from 'framer-motion'
import { Mail, Phone, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export const Founder = () => (
  <section id="founder" className="py-32 relative overflow-hidden bg-zinc-950/20">
    <div className="container mx-auto px-6">
      <div className="glass border border-white/5 rounded-[60px] p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="w-64 h-64 md:w-80 md:h-80 shrink-0 relative">
             <div className="absolute inset-0 border-2 border-rose-500 rounded-[60px] translate-x-4 translate-y-4" />
             <div className="relative w-full h-full rounded-[60px] overflow-hidden border border-white/10 shadow-2xl">
                <Image 
                  src="/founder-ceo-1.jpeg" 
                  alt="Founder CEO" 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                />
             </div>
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-zinc-500 font-black text-xs uppercase tracking-[5px] mb-6">Conoce al Creador</h2>
            <h3 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-4">
              Angel <span className="text-rose-600 not-italic">Fernandez</span>
            </h3>
            <p className="text-rose-500 font-black text-sm uppercase tracking-widest mb-10">Founder & Lead Engineer — Gosen Tech</p>
            
            <p className="text-zinc-400 text-xl md:text-2xl font-medium italic leading-relaxed mb-12 max-w-2xl">
              "Innovación local con visión global: Kitchy es la prueba de que el talento panameño no tiene fronteras."
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <div className="flex items-center gap-4 justify-center lg:justify-start group">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                     <Mail className="w-5 h-5 text-rose-500 group-hover:text-white" />
                  </div>
                  <span className="text-zinc-300 font-bold">adfp21900@gmail.com</span>
               </div>
               <div className="flex items-center gap-4 justify-center lg:justify-start group">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                     <Phone className="w-5 h-5 text-rose-500 group-hover:text-white" />
                  </div>
                  <span className="text-zinc-300 font-bold">+507 6801-4613</span>
               </div>
            </div>
            
            <a 
              href="https://nexus-hub-af.vercel.app/" 
              target="_blank" 
              className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-white/5 hover:shadow-rose-600/20"
            >
              Ver Nexus-Hub <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
)
