'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Cpu, ChefHat, BellDot, Database, Calculator } from 'lucide-react'
import Image from 'next/image'

const avatars = [
  { src: '/caitlyn_avatar.png', alt: 'Caitlyn Gastronomía', color: 'border-emerald-500/50 bg-emerald-950 shadow-emerald-500/20' },
  { src: '/caitlyn_beauty_avatar.png', alt: 'Caitlyn Belleza', color: 'border-indigo-500/50 bg-indigo-950 shadow-indigo-500/20' },
  { src: '/caitlyn_lavando_autos.png', alt: 'Caitlyn Lavautos', color: 'border-cyan-500/50 bg-cyan-950 shadow-cyan-500/20' },
  { src: '/caitlyn_jardinera.png', alt: 'Caitlyn Jardinería', color: 'border-green-500/50 bg-green-950 shadow-green-500/20' },
  { src: '/caitlyn_frutera.png', alt: 'Caitlyn Frutería', color: 'border-amber-500/50 bg-amber-950 shadow-amber-500/20' }
]

export const CaitlynAI = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveIndex(prev => (prev + 1) % avatars.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="caitlyn" className="py-32 relative">
      <div className="absolute inset-0 bg-emerald-600/5 blur-[120px] rounded-full mx-auto w-2/3 h-2/3 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        
        <div className="mb-12 relative w-40 h-40 mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className={`absolute inset-0 w-full h-full rounded-full border-4 overflow-hidden p-2 shadow-2xl ${avatars[activeIndex].color}`}
            >
              <Image
                src={avatars[activeIndex].src}
                alt={avatars[activeIndex].alt}
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="inline-block px-4 py-2 rounded-2xl glass border border-emerald-500/30 mb-8 mt-12">
          <span className="text-emerald-500 text-xs font-black tracking-[5px] uppercase">El Cerebro de la Operación</span>
        </div>
        <h2 className="text-5xl md:text-8xl font-black mb-12 uppercase italic tracking-tighter leading-none text-white">
          CONOCE A <span className="text-emerald-600 not-italic">CAITLYN</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {[
            { title: "Visión & OCR", desc: "Digitaliza facturas de proveedores Y cuadernos de venta manuales. Vesta aprende tus registros pasados.", icon: Eye },
            { title: "Radar Estratégico", desc: "Consejos basados en Merca Panamá, ACODECO, clima y gasolina para optimizar tus precios.", icon: Cpu },
            { title: "Chef IA", desc: "Sugiere nuevos platos e ingredientes basados en tu stock, calculando el precio ideal de venta.", icon: ChefHat },
            { title: "Alertas Críticas", desc: "Te avisa cuando un plato baja de tu margen objetivo de rentabilidad (65%) al instante.", icon: BellDot },
            { title: "Cero Placeholder", desc: "Aprende los nombres de tus insumos reales para nunca fallar en el stock ni en las compras.", icon: Database },
            { title: "Plan de Compras", desc: "Sabe exactamente qué te falta y estima el costo de tu lista de compras semanal.", icon: Calculator },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[40px] glass border-white/5 bg-zinc-900/20"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                <item.icon className="text-emerald-500 w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white mb-3 uppercase italic">{item.title}</h4>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
