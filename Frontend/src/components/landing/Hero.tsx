'use client'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Zap } from 'lucide-react'
import Image from 'next/image'

export const Hero = () => (
  <section id="inicio" className="relative min-h-screen flex items-center pt-24 overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute top-20 left-10 w-96 h-96 bg-rose-600/10 blur-[150px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-900/5 blur-[120px] rounded-full pointer-events-none" />

    <div className="container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Left Side: Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 text-left relative z-20"
      >
        {/* Background tilted squares (Top Left) */}
        <div className="absolute -top-32 -left-20 pointer-events-none hidden lg:block opacity-20">
          <div className="w-40 h-40 bg-zinc-800 rotate-[35deg] rounded-3xl border border-white/5 absolute -top-10 -left-10" />
          <div className="w-32 h-32 bg-rose-900/40 rotate-[15deg] rounded-3xl border border-rose-500/10 absolute top-20 left-10" />
        </div>
        <div className="inline-block px-3 py-1.5 rounded-xl glass border border-rose-500/20 mb-6">
          <span className="text-rose-500 text-[10px] font-black tracking-[3px] uppercase">Tu solución pro para gastronomía y belleza</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-5 text-white uppercase italic pt-2 px-1 relative inline-block">
          ¡Tu <span className="text-rose-600 not-italic">solución</span><br />
          para <span className="text-gradient pr-2">no perder</span><br />
          dinero!
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-600/20 rounded-full blur-xl animate-pulse" />
        </h1>

        <p className="text-zinc-500 text-[11px] md:text-[13px] leading-relaxed max-w-sm mb-10 font-medium opacity-70">
          Toma el control absoluto de tus ventas, mermas e inventarios. Kitchy es la inteligencia que tu negocio de comida necesita para ser rentable.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 relative">
          <button className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all glow-primary h-16 group z-10">
            PRUEBA GRATIS <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>

          {/* Decorative Semi-circle arc (Behind buttons) - Subtle again */}
          <div className="absolute -bottom-40 -left-60 w-[600px] h-[600px] rounded-full border border-rose-500/10 pointer-events-none hidden md:block" />
          <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] rounded-full border border-rose-500/5 pointer-events-none hidden md:block" />
        </div>
      </motion.div>

      {/* Right Side: Visual Mockup Re-scaled */}
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex-1 relative"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* 1. Ultra-vibrant core glow */}
          <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-rose-600/20 rounded-full blur-[100px] animate-pulse" />

          {/* 2. Rotating Neon Arc */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-[320px] h-[320px] md:w-[460px] md:h-[460px] rounded-full shadow-[0_0_50px_-12px_rgba(225,29,72,0.3)] border-t border-rose-500/40"
          />

          {/* 3. NEW: Rotating Dotted Middle Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-[290px] h-[290px] md:w-[420px] md:h-[420px] rounded-full border border-rose-500/40 border-dotted"
          />

          {/* 4. Outer Pulsing Dotted Ring */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[380px] h-[380px] md:w-[540px] md:h-[540px] rounded-full border border-rose-500/20 border-dotted"
          />
        </div>

        {/* Floating Metric Bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bubble 1: Analytics */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[18%] right-[12%] w-14 h-14 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center border-white/10 shadow-xl z-20"
          >
            <BarChart3 className="text-rose-500 w-6 h-6 md:w-8 md:h-8" />
          </motion.div>

          {/* Bubble 2: Trends */}
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[18%] left-[8%] w-12 h-12 md:w-14 md:h-14 glass rounded-2xl flex items-center justify-center border-white/10 shadow-xl z-20"
          >
            <TrendingUp className="text-rose-500 w-5 h-5 md:w-7 md:h-7" />
          </motion.div>

          {/* Bubble 3: Orders */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[22%] right-[8%] w-10 h-10 md:w-12 md:h-12 glass rounded-2xl flex items-center justify-center border-white/10 shadow-xl z-20"
          >
            <Zap className="text-rose-500 w-4 h-4 md:w-6 md:h-6" />
          </motion.div>
        </div>

        {/* Main Hero Image: Circular Profile */}
        <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] mx-auto rounded-full overflow-hidden border-8 border-white/5 relative shadow-glow">
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/40 to-transparent z-10 pointer-events-none" />
          <Image
            src="/chef-final.jpg"
            alt="Kitchy Business Owner"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
          />
        </div>

      </motion.div>
    </div>
  </section>
)
