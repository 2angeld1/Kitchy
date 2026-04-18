'use client'
import { motion } from 'framer-motion'
import { Utensils, Scissors, CheckCircle2 } from 'lucide-react'

export const Verticals = () => (
  <section id="que-es" className="py-32 relative">
    <div className="container mx-auto px-6">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter text-white">DOS MUNDOS, <span className="text-rose-600">UNA SOLUCIÓN</span></h2>
        <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium">Kitchy se adapta a la lógica específica de tu negocio en Panamá.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          whileHover={{ y: -10 }}
          className="p-12 rounded-[50px] glass border-rose-500/20 bg-gradient-to-br from-rose-600/10 to-transparent relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-16 h-16 bg-rose-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-rose-900/40">
              <Utensils className="text-white w-8 h-8" />
            </div>
            <h3 className="text-4xl font-black text-white mb-6 uppercase italic">Gastronomía</h3>
            <ul className="space-y-4">
              {[
                "Costeo de platos por ingrediente",
                "Inventario granular (kg, lb, litros)",
                "Escaneo OCR de facturas y ventas",
                "Ideas de platos vía Caitlyn AI"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 font-bold group-hover:text-white transition-colors">
                  <CheckCircle2 className="text-rose-500 w-5 h-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-10 -right-20 opacity-5 group-hover:opacity-10 transition-opacity">
            <Utensils className="w-80 h-80 text-white" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -10 }}
          className="p-12 rounded-[50px] glass border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-transparent relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-900/40">
              <Scissors className="text-white w-8 h-8" />
            </div>
            <h3 className="text-4xl font-black text-white mb-6 uppercase italic">Salud & Belleza</h3>
            <ul className="space-y-4">
              {[
                "Comisiones escalonadas dinámicas",
                "Gestión de turnos y especialistas",
                "Inventario de productos de uso",
                "Proyecciones de ventas de servicios"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 font-bold group-hover:text-white transition-colors">
                  <CheckCircle2 className="text-indigo-500 w-5 h-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-10 -right-20 opacity-5 group-hover:opacity-10 transition-opacity">
            <Scissors className="w-80 h-80 text-white" />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
)
