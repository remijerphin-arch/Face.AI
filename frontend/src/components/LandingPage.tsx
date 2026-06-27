"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ScanFace, Sparkles, Smile, Scissors, Palette, Eye, Glasses, 
  Shirt, UserCheck, Flame, Bot, Calendar, ShieldAlert, Sun, Moon, 
  ArrowRight, Lock, CheckCircle2, RefreshCw, Layers, Zap
} from "lucide-react";

interface LandingPageProps {
  onStartAnalysis: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export default function LandingPage({ onStartAnalysis, theme, toggleTheme }: LandingPageProps) {
  const features = [
    { icon: ScanFace, title: "AI Face Analysis", desc: "Complete structural evaluation of your unique facial landmarks.", color: "text-blue-500 bg-blue-500/10" },
    { icon: Layers, title: "Face Shape Detection", desc: "Identifies whether your face is Oval, Round, Square, Heart, or Diamond.", color: "text-purple-500 bg-purple-500/10" },
    { icon: Sparkles, title: "Skin Analysis", desc: "Scans for acne, wrinkles, hydration levels, pores, and pigmentation.", color: "text-rose-500 bg-rose-500/10" },
    { icon: Smile, title: "Face Symmetry Analysis", desc: "Measures left-right balance proportions against the golden ratio.", color: "text-emerald-500 bg-emerald-500/10" },
    { icon: Scissors, title: "Hairstyle Recommendation", desc: "Suggests 10 custom hairstyles that best balance your face shape.", color: "text-amber-500 bg-amber-500/10" },
    { icon: Palette, title: "Hair Color Suitability", desc: "Matches color tones to your face contrast and skin warmth.", color: "text-pink-500 bg-pink-500/10" },
    { icon: Zap, title: "Beard Style Recommendation", desc: "Suggests stubble, full, or goatee styles to structure your jawline.", color: "text-indigo-500 bg-indigo-500/10" },
    { icon: Eye, title: "Eyebrow Analysis", desc: "Suggests brow thicknesses and shapes to frame your eyes.", color: "text-teal-500 bg-teal-500/10" },
    { icon: Glasses, title: "Glasses Recommendation", desc: "Matches square, aviator, or round frames to balance your silhouette.", color: "text-cyan-500 bg-cyan-500/10" },
    { icon: Shirt, title: "Fashion Recommendation", desc: "Outfit combinations tailored to your facial structure and body type.", color: "text-orange-500 bg-orange-500/10" },
    { icon: UserCheck, title: "Celebrity Look-alike", desc: "Calculates similarity percentage to Hollywood stars.", color: "text-violet-500 bg-violet-500/10" },
    { icon: Calendar, title: "30-Day Glow-Up Planner", desc: "Custom day-by-day morning and night skin, hair, and lifestyle routines.", color: "text-emerald-500 bg-emerald-500/10" },
    { icon: Bot, title: "AI Chat Assistant", desc: "A floating assistant that knows your scan results and answers your style queries.", color: "text-blue-500 bg-blue-500/10" },
    { icon: Palette, title: "Personal Color Analysis", desc: "Finds your undertone (Warm/Cool/Olive) and tells you which colors to avoid.", color: "text-red-500 bg-red-500/10" },
    { icon: Sparkles, title: "AI Beauty Assistant", desc: "Suggests ingredients (Retinol, Niacinamide) to address skin imperfections.", color: "text-yellow-500 bg-yellow-500/10" },
    { icon: Shirt, title: "AI Fashion Stylist", desc: "Generates tailored outfits for Casual, Formal, and Party events.", color: "text-lime-500 bg-lime-500/10" },
    { icon: RefreshCw, title: "Instant Scan Engine", desc: "All recommendations generated in under 10 seconds securely.", color: "text-indigo-500 bg-indigo-500/10" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-radial from-blue-500/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-radial from-cyber-purple/20 to-transparent blur-[120px] pointer-events-none" />

      {/* Floating Particles Simulation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4 rounded-full bg-electric-blue animate-pulse-slow">
            <span className="absolute inset-0 rounded-full bg-electric-blue/50 scale-150 animate-ping" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight select-none">
            Face<span className="premium-text-gradient">Sense</span> AI
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/75">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#privacy" className="hover:text-foreground transition-colors">Privacy Assurance</a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Privacy badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/15">
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">100% Privacy Guaranteed</span>
          </div>

          {/* Theme toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-foreground/10 hover:bg-foreground/5 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Action button */}
          <button 
            onClick={onStartAnalysis}
            className="px-4 py-2 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            Start Free Scan
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 md:pt-28 max-w-5xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Tag */}
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-electric-blue/10 text-electric-blue border border-electric-blue/10 mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} /> Next-Generation Facial Intelligence
          </span>

          {/* Title */}
          <h1 className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-6 max-w-3xl">
            Discover Your Best Look <br className="hidden sm:inline" />
            with <span className="premium-text-gradient">Advanced AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl leading-relaxed mb-10 font-normal">
            Upload a photo or take a live selfie. Our AI analyzes your facial features and provides personalized recommendations for skincare, hairstyle, beard, fashion, colors, accessories, and overall appearance in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold bg-electric-blue text-white hover:bg-electric-blue-hover transition-all shadow-[0_4px_20px_rgba(0,113,227,0.3)] hover:shadow-[0_4px_25px_rgba(0,113,227,0.4)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              Start Free Analysis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold border border-foreground/10 hover:bg-foreground/5 transition-all flex items-center justify-center cursor-pointer"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Hero Interactive UI Preview (floating cards) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 w-full max-w-4xl relative aspect-[16/9] rounded-2xl border border-foreground/5 bg-foreground/[0.01] glass-panel overflow-hidden p-6 flex items-center justify-center"
        >
          {/* Glass dashboard preview mockup */}
          <div className="w-full h-full flex flex-col md:flex-row gap-6 items-center">
            {/* Scan wireframe mock */}
            <div className="w-full md:w-[45%] h-full rounded-xl border border-foreground/10 bg-background/30 relative overflow-hidden flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gradient-to-t from-electric-blue/10 to-transparent" />
              {/* Scanner laser bar */}
              <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-electric-blue to-transparent top-[40%] animate-scan" />
              {/* Decorative wireframe face overlay */}
              <div className="w-36 h-48 rounded-[4rem] border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center relative animate-pulse-slow">
                <div className="w-12 h-6 border-b border-foreground/20 absolute top-[40%]" />
                <div className="w-2 h-8 bg-foreground/20 rounded-full absolute top-[30%]" />
                <div className="w-16 h-8 rounded-full border border-foreground/20 absolute bottom-[20%]" />
              </div>
              <div className="absolute bottom-4 left-4 text-left font-mono text-[10px] text-foreground/40">
                <div>SYS_MODE: STANDBY</div>
                <div>LNDMRK_DETECTION: 68/68</div>
              </div>
            </div>

            {/* Recommendations mock */}
            <div className="flex-1 w-full h-full flex flex-col justify-between py-2 text-left">
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-foreground/5 glass-card flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <ScanFace className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Face Structure Detected</h3>
                    <p className="text-xs text-foreground/60 mt-1">Oval contour with 96% symmetrical match. Excellent forehead to jawline ratio.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-foreground/5 glass-card flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Active Skin Analysis</h3>
                    <p className="text-xs text-foreground/60 mt-1">Hydration level: 88% (Optimal). T-Zone oiliness detected. Wrinkle rating: Minimal.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-foreground/5 glass-card flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Personal Color Analysis</h3>
                    <p className="text-xs text-foreground/60 mt-1">Undertone: Cool Olive. Recommended Shirt colors: Emerald Green, Midnight Blue.</p>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-foreground/40 mt-4 italic">
                🔒 Private Session. No photos stored.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 border-t border-foreground/5 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl mb-4">Precision Aesthetics Engine</h2>
            <p className="text-foreground/60 max-w-xl mx-auto text-sm sm:text-base">
              A comprehensive evaluation of your visual styling structure. Explore our suite of 17 analysis vectors designed to refine your everyday look.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-6 rounded-2xl glass-card flex flex-col justify-between"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-base text-foreground">{feature.title}</h3>
                    <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Notice Banner */}
      <section id="privacy" className="py-16 border-t border-foreground/5 bg-foreground/[0.02] relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-outfit font-bold text-2xl sm:text-3xl mb-4">Absolute Privacy. Zero Storing.</h2>
          <div className="glass-panel p-8 rounded-2xl border-emerald-500/20 max-w-2xl mx-auto text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl" />
            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed mb-4 font-medium">
              "Your privacy comes first. Your photos, analysis, and conversations are never stored. Everything is processed securely in volatile memory and permanently deleted after your session ends."
            </p>
            <div className="space-y-2 mt-4 text-xs text-foreground/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero Database: Photos are processed in-memory and immediately destroyed.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero tracking cookies: Session is entirely temporary and local.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No AI Training: Your images or queries will never train models.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/5 px-6 py-8 text-center text-xs text-foreground/50 z-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 FaceSense AI. All rights reserved. Apple-level design meets secure facial intelligence.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
