'use client'
import { motion } from 'framer-motion'
import { Utensils, Scissors, CheckCircle2, Car, Leaf, Apple } from 'lucide-react'

export const Verticals = () => (
  <section id="que-es" className="py-32 relative">
    <div className="container mx-auto px-6">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter text-white">CINCO MUNDOS, <span className="text-emerald-600">UNA SOLUCIÓN</span></h2>
        <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium">Vesta se adapta a la lógica específica de tu negocio en Panamá.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 1. Gastronomía */}
        <motion.div
          whileHover={{ y: -10 }}
          className="p-8 md:p-10 rounded-[40px] glass border-rose-500/20 bg-gradient-to-br from-rose-600/10 to-transparent relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 bg-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-rose-900/40">
              <Utensils className="text-white w-7 h-7" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase italic">Gastronomía</h3>
            <ul className="space-y-4">
              {[
                "Costeo de platos por ingrediente",
                "Inventario granular (kg, lb, litros)",
                "Escaneo OCR de facturas y ventas",
                "Ideas de platos vía Caitlyn AI"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 font-bold group-hover:text-white transition-colors text-sm">
                  <CheckCircle2 className="text-rose-500 w-5 h-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Utensils className="w-64 h-64 text-white" />
          </div>
        </motion.div>

        {/* 2. Salud & Belleza */}
        <motion.div
          whileHover={{ y: -10 }}
          className="p-8 md:p-10 rounded-[40px] glass border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-transparent relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-900/40">
              <Scissors className="text-white w-7 h-7" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase italic">Salud & Belleza</h3>
            <ul className="space-y-4">
              {[
                "Comisiones escalonadas dinámicas",
                "Gestión de turnos y especialistas",
                "Inventario de productos de uso",
                "Proyecciones de ventas de servicios"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 font-bold group-hover:text-white transition-colors text-sm">
                  <CheckCircle2 className="text-indigo-500 w-5 h-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Scissors className="w-64 h-64 text-white" />
          </div>
        </motion.div>

        {/* 3. Lavautos */}
        <motion.div
          whileHover={{ y: -10 }}
          className="p-8 md:p-10 rounded-[40px] glass border-cyan-500/20 bg-gradient-to-br from-cyan-600/10 to-transparent relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 bg-cyan-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-900/40">
              <Car className="text-white w-7 h-7" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase italic">Lavautos</h3>
            <ul className="space-y-4">
              {[
                "Registro de servicios rápidos",
                "Control de especialistas sin local fijo",
                "Manejo de comisiones por lavado",
                "Reporte de insumos (champú, ceras)"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 font-bold group-hover:text-white transition-colors text-sm">
                  <CheckCircle2 className="text-cyan-500 w-5 h-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Car className="w-64 h-64 text-white" />
          </div>
        </motion.div>

        {/* 4. Jardinería */}
        <motion.div
          whileHover={{ y: -10 }}
          className="p-8 md:p-10 rounded-[40px] glass border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-transparent relative overflow-hidden group lg:col-start-1"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/40">
              <Leaf className="text-white w-7 h-7" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase italic">Jardinería</h3>
            <ul className="space-y-4">
              {[
                "Presupuestario por cliente",
                "Control de equipos y herramientas",
                "Recordatorios de mantenimiento",
                "Gastos de combustible integrados"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 font-bold group-hover:text-white transition-colors text-sm">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Leaf className="w-64 h-64 text-white" />
          </div>
        </motion.div>

        {/* 5. Frutería */}
        <motion.div
          whileHover={{ y: -10 }}
          className="p-8 md:p-10 rounded-[40px] glass border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-transparent relative overflow-hidden group lg:col-span-2"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 bg-amber-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-amber-900/40">
              <Apple className="text-white w-7 h-7" />
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase italic">Frutería y Mercados</h3>
            <ul className="space-y-4 grid sm:grid-cols-2 gap-x-4">
              {[
                "Control estricto de mermas",
                "Precios dinámicos vs Merca Panamá",
                "Gestión de proveedores locales",
                "Ventas rápidas al peso (balanza)"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-400 font-bold group-hover:text-white transition-colors text-sm">
                  <CheckCircle2 className="text-amber-500 w-5 h-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Apple className="w-64 h-64 text-white" />
          </div>
        </motion.div>

      </div>
    </div>
  </section>
)
