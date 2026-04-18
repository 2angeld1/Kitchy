'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, Cpu, ChefHat, BellDot, Database, Calculator } from 'lucide-react'
import Image from 'next/image'

export const CaitlynAI = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setIsFlipped(prev => !prev), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="caitlyn" className="py-32 relative">
      <div className="absolute inset-0 bg-rose-600/5 blur-[120px] rounded-full mx-auto w-2/3 h-2/3 pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* Avatars Coin Flip */}
        <div className="mb-12 relative w-40 h-40 mx-auto perspective-1000">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-full relative preserve-3d"
          >
            {/* Front: Gastronomía */}
            <div className="absolute inset-0 backface-hidden w-full h-full rounded-full border-4 border-rose-500/50 overflow-hidden bg-rose-950 p-2 shadow-2xl shadow-rose-500/20">
              <Image
                src="/caitlyn_avatar.png"
                alt="Caitlyn Gastronomía"
                fill
                className="object-cover"
              />
            </div>
            {/* Back: Belleza */}
            <div className="absolute inset-0 w-full h-full rounded-full border-4 border-indigo-500/50 overflow-hidden bg-indigo-950 p-2 [transform:rotateY(180deg)] backface-hidden shadow-2xl shadow-indigo-500/20">
              <Image
                src="/caitlyn_beauty_avatar.png"
                alt="Caitlyn Belleza"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>

        <div className="inline-block px-4 py-2 rounded-2xl glass border border-rose-500/30 mb-8">
          <span className="text-rose-500 text-xs font-black tracking-[5px] uppercase">El Cerebro de la Operación</span>
        </div>
        <h2 className="text-5xl md:text-8xl font-black mb-12 uppercase italic tracking-tighter leading-none text-white">
          CONOCE A <span className="text-rose-600 not-italic">CAITLYN</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {[
            { title: "Visión & OCR", desc: "Digitaliza facturas de proveedores Y cuadernos de venta manuales. Kitchy aprende tus registros pasados.", icon: Eye },
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
                <item.icon className="text-rose-500 w-6 h-6" />
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
