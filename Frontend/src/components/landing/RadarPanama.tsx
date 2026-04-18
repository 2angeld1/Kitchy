'use client'
import { ShoppingBag, Zap, Globe, CheckCircle2 } from 'lucide-react'

export const RadarPanama = () => (
  <section id="radar" className="py-32 relative overflow-hidden">
    <div className="container mx-auto px-6">
      <div className="flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-emerald-500/30 mb-8">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Conexión en Vivo</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase italic tracking-tighter leading-[0.9] text-white">
            EL RADAR DE <span className="text-rose-600 not-italic">PANAMÁ</span>
          </h2>
          <p className="text-zinc-400 text-xl font-medium leading-relaxed mb-10">
            Caitlyn no solo analiza tus datos internos, está conectada al **pulso real del mercado panameño** para darte consejos estratégicos que nadie más puede dar.
          </p>

          <div className="space-y-6">
            {[
              { label: "Merca Panamá", detail: "Precios de vegetales y carnes actualizados semanalmente.", icon: ShoppingBag },
              { label: "SNE Panamá", detail: "Ajustes quincenales de combustible (91, 95 y Diésel).", icon: Zap },
              { label: "Clima Local", detail: "Pronóstico diario para predecir afluencia en tu local.", icon: Globe },
              { label: "ACODECO", detail: "Monitoreo de canasta básica y precios controlados.", icon: CheckCircle2 }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-wider">{item.label}</h4>
                  <p className="text-zinc-500 text-xs font-medium">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-rose-600/20 blur-[120px] rounded-full" />
          <div className="relative glass border border-white/10 p-12 rounded-[60px] bg-zinc-950/40 backdrop-blur-3xl">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[4px] mb-2">Estado del Mercado</p>
                <p className="text-2xl font-black text-white italic">"Caitlyn Insight"</p>
              </div>
              <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Optimizado</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                <p className="text-zinc-400 text-sm leading-relaxed italic">
                  "El precio del tomate en **Merca Panamá** ha subido un 15% debido a las lluvias en Chiriquí. Te sugiero ajustar el precio de tu Ensalada de la Casa o rotar inventario antes del jueves."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Gasolina 95</p>
                  <p className="text-xl font-black text-white">$1.02 <span className="text-xs text-rose-500">↑</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase font-black mb-1">Clima PTY</p>
                  <p className="text-xl font-black text-white">Tormenta <span className="text-xs text-indigo-400">☔</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)
