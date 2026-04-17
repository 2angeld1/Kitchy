'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Smartphone, 
  MessageCircle, 
  TrendingUp, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Users, 
  Zap,
  Globe,
  Star,
  Menu,
  X
} from 'lucide-react'

// --- Componentes de UI ---

const Nav = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">KITCHY</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#inicio" className="hover:text-rose-500 transition-colors">Inicio</a>
          <a href="#que-es" className="hover:text-rose-500 transition-colors">¿Qué es?</a>
          <a href="#clientes" className="hover:text-rose-500 transition-colors">Negocios</a>
          <a href="#tutoriales" className="hover:text-rose-500 transition-colors">Tutoriales</a>
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-full shadow-lg shadow-rose-900/20 transition-all active:scale-95">
            Abrir App
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass mt-2 mx-4 rounded-2xl overflow-hidden md:hidden border border-zinc-800"
          >
            <div className="flex flex-col p-6 gap-6">
              <a href="#inicio" className="text-lg font-medium text-white" onClick={() => setMobileMenu(false)}>Inicio</a>
              <a href="#que-es" className="text-lg font-medium text-white" onClick={() => setMobileMenu(false)}>¿Qué es?</a>
              <a href="#clientes" className="text-lg font-medium text-white" onClick={() => setMobileMenu(false)}>Negocios</a>
              <a href="#tutoriales" className="text-lg font-medium text-white" onClick={() => setMobileMenu(false)}>Tutoriales</a>
              <button className="bg-rose-600 text-white py-4 rounded-xl font-bold">Abrir App</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

const Hero = () => {
  return (
    <section id="inicio" className="pt-32 pb-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -mr-40 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 -ml-40 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-rose-500 text-xs font-bold tracking-widest uppercase mb-6 border border-rose-500/20">
            <Zap className="w-3 h-3 fill-rose-500" /> Versión 2.0 ya disponible
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
            <span className="text-gradient">GESTIONA TU NEGOCIO</span><br />
            <span className="text-rose-600">SIN LÍMITES</span>
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl leading-relaxed mb-10">
            Kitchy es el puente digital entre tu negocio y tus clientes. 
            Controla ventas, inventarios y automatiza tu WhatsApp desde una sola plataforma.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 group transition-all glow-primary h-16">
            Comenzar Ahora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="glass hover:bg-zinc-800/80 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all h-16 border border-zinc-700">
            Ver Demo <Play className="w-5 h-5 fill-white" />
          </button>
        </motion.div>

        {/* Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-5xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-rose-600/20 blur-[100px] -z-10 rounded-full" />
          <div className="glass rounded-[40px] p-4 border-zinc-800 aspect-video md:aspect-[21/9] overflow-hidden group shadow-2xl">
            <div className="w-full h-full bg-zinc-900 rounded-[28px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-rose-600/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Play className="text-rose-600 w-8 h-8 fill-rose-600" />
                </div>
                <p className="font-bold text-zinc-500 uppercase tracking-widest text-xs">Vista previa de Kitchy Desktop</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const FeatureCard = ({ icon: Icon, title, desc, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-8 rounded-[32px] glass hover:bg-zinc-800/50 transition-all group border border-zinc-800/50"
  >
    <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all text-rose-500">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
    <p className="text-zinc-500 leading-relaxed text-sm md:text-base">{desc}</p>
  </motion.div>
)

const Features = () => {
  return (
    <section id="que-es" className="py-24 bg-black/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">MÁS QUE UNA SIMPLE APP</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Diseñada para emprendedores que buscan eficiencia y elegancia en su flujo de trabajo diario.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Smartphone} 
            title="PWA Multiplataforma" 
            desc="Accede desde tu iPad, Celular o PC. La misma potencia en todos tus dispositivos con sincronización en tiempo real." 
            delay={0.1}
          />
          <FeatureCard 
            icon={MessageCircle} 
            title="Conector WhatsApp" 
            desc="Envía tickets de venta, estados de pedido y promociones directamente al WhatsApp de tus clientes." 
            delay={0.2}
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="Estrategia Caitlyn" 
            desc="Nuestra IA integrada que analiza tus deudas, inventarios y te sugiere las mejores estrategias de venta." 
            delay={0.3}
          />
        </div>
      </div>
    </section>
  )
}

const Clients = () => {
  const clients = [
    { name: "The Barber", type: "Barbería", status: "Activo" },
    { name: "Kitchy Food", type: "Restaurante", status: "Proceso" },
    { name: "Nails Pro", type: "Salón de Belleza", status: "Activo" },
    { name: "Iron Gym", type: "Gimnasio", status: "Proceso" },
  ]

  return (
    <section id="clientes" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl text-left">
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">Negocios en la red</h2>
            <p className="text-zinc-500">Únete a la creciente comunidad de negocios que están digitalizando sus operaciones con nosotros.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-12 h-12 rounded-full border-4 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                   <Users className="w-5 h-5 text-zinc-500" />
                 </div>
               ))}
             </div>
             <span className="text-zinc-400 font-bold text-sm">+50 negocios registrados</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clients.map((client, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-[28px] glass border-zinc-800/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-zinc-500" />
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${client.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {client.status}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white">{client.name}</h4>
                <p className="text-zinc-500 text-sm mt-1">{client.type}</p>
              </div>
              <button className="mt-8 text-rose-500 font-bold text-sm inline-flex items-center gap-2 hover:gap-3 transition-all">
                Ver perfil <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Tutorials = () => {
  const videos = [
    { title: "Primeros Pasos", dur: "3:45", thumb: "bg-gradient-to-br from-rose-900 to-zinc-900" },
    { title: "Gestión de Inventarios", dur: "5:20", thumb: "bg-gradient-to-br from-indigo-900 to-zinc-900" },
    { title: "Reportes Financieros", dur: "4:10", thumb: "bg-gradient-to-br from-amber-900 to-zinc-900" },
  ]

  return (
    <section id="tutoriales" className="py-24 bg-zinc-950/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">Aprende con Kitchy</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Domina la plataforma con nuestros tutoriales paso a paso diseñados para ti.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {videos.map((vid, i) => (
            <div key={i} className="group cursor-pointer">
              <div className={`relative aspect-video rounded-[32px] ${vid.thumb} mb-6 overflow-hidden flex items-center justify-center border border-zinc-800 group-hover:border-rose-500/50 transition-all`}>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="relative z-10 w-14 h-14 bg-white rounded-full flex items-center justify-center group-hover:scale-125 transition-transform">
                   <Play className="text-black fill-black w-6 h-6 ml-1" />
                </div>
                <span className="absolute bottom-4 right-4 bg-black/80 px-2 py-1 rounded-md text-[10px] font-black text-white">{vid.dur}</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-rose-500 transition-colors uppercase">{vid.title}</h4>
              <p className="text-zinc-500 text-sm mt-2">Tutorial completo de configuración básica.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Footer = () => (
  <footer className="py-20 border-t border-zinc-900">
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">KITCHY</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed">
            La herramienta definitiva para el emprendedor moderno. Gestiona, escala y crece con tecnología de punta.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
          <div>
            <h5 className="text-white font-black text-sm uppercase mb-6 tracking-widest">Producto</h5>
            <div className="flex flex-col gap-4 text-zinc-500 text-sm">
              <a href="#" className="hover:text-rose-500">App</a>
              <a href="#" className="hover:text-rose-500">Características</a>
              <a href="#" className="hover:text-rose-500">Precios</a>
            </div>
          </div>
          <div>
            <h5 className="text-white font-black text-sm uppercase mb-6 tracking-widest">Soporte</h5>
            <div className="flex flex-col gap-4 text-zinc-500 text-sm">
              <a href="#" className="hover:text-rose-500">Documentación</a>
              <a href="#" className="hover:text-rose-500">Tutoriales</a>
              <a href="#" className="hover:text-rose-500">Contacto</a>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h5 className="text-white font-black text-sm uppercase mb-6 tracking-widest">Newsletter</h5>
            <div className="relative">
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:border-rose-500 transition-all text-white" 
              />
              <button className="absolute right-2 top-2 bg-rose-600 text-white p-1 rounded-lg">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20 pt-8 border-t border-zinc-950 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-zinc-600 text-[10px] uppercase font-black tracking-widest">© 2026 KITCHY TECHNOLOGIES. TODOS LOS DERECHOS RESERVADOS.</p>
        <div className="flex gap-6 text-zinc-600 text-[10px] uppercase font-black tracking-widest">
           <a href="#" className="hover:text-white">Privacidad</a>
           <a href="#" className="hover:text-white">Términos</a>
        </div>
      </div>
    </div>
  </footer>
)

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-rose-500 selection:text-white scroll-smooth underline-offset-4">
      <Nav />
      <Hero />
      <Features />
      <Clients />
      <Tutorials />
      <Footer />
    </main>
  )
}
