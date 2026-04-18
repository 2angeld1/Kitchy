'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export const Demos = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const verticalVideos = [
    { src: "/Caitlyn dando ideas de producto.mp4", title: "Ideas de Platos", tag: "Caitlyn AI", desc: "Sugerencias inteligentes para tu menú." },
    { src: "/caitlyn recomendando ingredientes.mp4", title: "Insumos Pro", tag: "Caitlyn AI", desc: "Optimización de ingredientes y costos." },
    { src: "/OCR inventario demostracion.mp4", title: "Gestión OCR", tag: "Inventario", desc: "Digitalización de facturas al instante." }
  ]

  return (
    <section id="demos" className="py-32 relative overflow-hidden bg-zinc-950/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase italic tracking-tighter">
            KITCHY EN <span className="text-rose-600 not-italic">ACCIÓN</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed">
            Mira la potencia de Caitlyn AI y el sistema de gestión en tiempo real.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Top Row: Grande + Una Vertical */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* LADO GRANDE: Negocio Conjunto */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setSelectedVideo("/negocio usando kitchy p1.mp4")}
              className="lg:col-span-2 group cursor-pointer w-full h-[450px] md:h-[600px]"
            >
              <div className="relative h-full rounded-[60px] overflow-hidden border border-zinc-800 bg-black shadow-2xl group-hover:border-rose-500/50 transition-all">
                <div className="absolute inset-0 grid grid-cols-2 gap-1 opacity-80">
                  <video src="/negocio usando kitchy p1.mp4" className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  <video src="/negocio usando kitchy p2.mp4" className="w-full h-full object-cover" autoPlay muted loop playsInline />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                  <span className="text-rose-500 text-[10px] font-black uppercase tracking-[5px] mb-2">Sistema Central</span>
                  <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Control 360°</h3>
                  <p className="text-zinc-400 font-medium mt-2 max-w-md">La operatividad completa de tu negocio en una sola app.</p>
                </div>
              </div>
            </motion.div>

            {/* LADO VERTICAL: Idea de productos */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              onClick={() => setSelectedVideo(verticalVideos[0].src)}
              className="group cursor-pointer h-[450px] md:h-[600px]"
            >
              <div className="relative h-full rounded-[60px] overflow-hidden border border-zinc-800 bg-black shadow-2xl group-hover:border-rose-500/50 transition-all">
                <video src={verticalVideos[0].src} className="w-full h-full object-cover opacity-80" autoPlay muted loop playsInline />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                  <div className="px-4 py-1.5 bg-rose-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 inline-block w-fit">
                    {verticalVideos[0].tag}
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{verticalVideos[0].title}</h3>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: Resto de Verticales */}
          <div className="grid md:grid-cols-2 gap-8">
            {verticalVideos.slice(1).map((vid, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedVideo(vid.src)}
                className="group cursor-pointer h-[500px]"
              >
                <div className="relative h-full rounded-[60px] overflow-hidden border border-zinc-800 bg-black shadow-2xl group-hover:border-rose-500/50 transition-all">
                  <video 
                    src={vid.src} 
                    className="w-full h-full object-cover opacity-80"
                    autoPlay muted loop playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                    <div className="px-4 py-1.5 bg-rose-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 inline-block w-fit">
                      {vid.tag}
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{vid.title}</h3>
                    <p className="text-zinc-400 font-medium mt-2">{vid.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FULLSCREEN MODAL VIEWER */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-20"
            onClick={() => setSelectedVideo(null)}
          >
            <button className="absolute top-10 right-10 text-white hover:text-rose-500 transition-colors z-[110]">
               <X className="w-10 h-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full h-full max-w-5xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <video 
                src={selectedVideo} 
                controls 
                autoPlay 
                className="max-w-full max-h-full rounded-3xl shadow-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
