'use client'
import { motion } from 'framer-motion'
import { ShieldCheck, TrendingUp, BarChart3 } from 'lucide-react'

export const Features = () => (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { 
              title: "Control Total", 
              desc: "Monitorea cada centavo. Desde el costo del tomate hasta la comisión del barbero.", 
              icon: ShieldCheck,
              color: "text-rose-500" 
            },
            { 
              title: "Crecimiento Real", 
              desc: "No más dudas. Toma decisiones basadas en datos reales del mercado panameño.", 
              icon: TrendingUp,
              color: "text-emerald-500" 
            },
            { 
              title: "Analítica Pro", 
              desc: "Reportes automáticos que te dicen dónde estás perdiendo dinero hoy mismo.", 
              icon: BarChart3,
              color: "text-indigo-500" 
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group p-10 rounded-[40px] glass border-white/5 bg-zinc-900/10 hover:bg-zinc-900/40 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`${feature.color} w-7 h-7`} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase italic">{feature.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
)
