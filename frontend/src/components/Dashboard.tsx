"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ScanFace, Sparkles, Scissors, Palette, Glasses, Shirt, 
  Calendar, MessageSquare, ShieldAlert, CheckCircle, Flame, 
  Maximize2, Eye, Award, Heart, HelpCircle, User, Star, Send, X, ArrowUpRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { getApiUrl } from "@/utils/api";

interface DashboardProps {
  imageSrc: string;
  analysis: any;
  onReset: () => void;
}

export default function Dashboard({ imageSrc, analysis, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "face" | "skin" | "hair" | "style" | "plan">("overview");
  const [showMesh, setShowMesh] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Trigger celebration on load
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#0071e3", "#a100ff", "#ffe066"]
    });

    // Initialize chatbot welcome message
    const shape = analysis.face_shape.name;
    const skinScore = analysis.skin_analysis.overall_score;
    const undertone = analysis.color_analysis.undertone;
    
    setChatHistory([
      {
        role: "assistant",
        content: `Welcome to your FaceSense AI dashboard! I have analyzed your face. You have a beautiful **${shape}** face shape with a **${undertone}** skin undertone and an overall skin score of **${skinScore}/100**. \n\nWhat styling, grooming, or skincare routine questions can I answer for you today?`
      }
    ]);
  }, [analysis]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Draw face mesh on photo canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const cw = canvas.width = canvas.clientWidth;
      const ch = canvas.height = canvas.clientHeight;
      
      ctx.clearRect(0, 0, cw, ch);

      // Fit image
      const imgRatio = img.width / img.height;
      const canvasRatio = cw / ch;
      let dx = 0, dy = 0, dw = cw, dh = ch;
      
      if (imgRatio > canvasRatio) {
        dw = ch * imgRatio;
        dx = (cw - dw) / 2;
      } else {
        dh = cw / imgRatio;
        dy = (ch - dh) / 2;
      }
      
      ctx.drawImage(img, dx, dy, dw, dh);

      if (showMesh && analysis.landmarks) {
        // Draw 68 landmarks from backend report
        const scaleX = dw / analysis.dimensions.width;
        const scaleY = dh / analysis.dimensions.height;

        // Draw connections
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "rgba(0, 113, 227, 0.3)";
        const lms = analysis.landmarks;

        // Draw triangulation lines based on proximity
        for (let i = 0; i < lms.length; i++) {
          const x1 = lms[i].x * scaleX + dx;
          const y1 = lms[i].y * scaleY + dy;
          for (let j = i + 1; j < lms.length; j++) {
            const x2 = lms[j].x * scaleX + dx;
            const y2 = lms[j].y * scaleY + dy;
            const dist = Math.hypot(x1 - x2, y1 - y2);
            if (dist < 35) {
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        }

        // Draw dots
        lms.forEach((pt: any, idx: number) => {
          const x = pt.x * scaleX + dx;
          const y = pt.y * scaleY + dy;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, 2 * Math.PI);
          ctx.fillStyle = idx % 2 === 0 ? "rgba(0, 113, 227, 0.85)" : "rgba(161, 0, 255, 0.85)";
          ctx.fill();
        });
      }
    };
  }, [imageSrc, showMesh, analysis]);

  // Handle chatbot query
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory,
          analysis: analysis
        })
      });

      if (!response.ok) {
        throw new Error("Chat assistant failed to respond.");
      }

      const data = await response.json();
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err: any) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Apologies, I encountered an issue connecting to the styling engine. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col pb-16">
      {/* Background gradients */}
      <div className="absolute top-[5%] left-[5%] w-[45%] h-[45%] rounded-full bg-gradient-radial from-blue-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[5%] w-[45%] h-[45%] rounded-full bg-gradient-radial from-cyber-purple/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-outfit font-bold text-xl tracking-tight">
            Face<span className="premium-text-gradient">Sense</span> AI
          </span>
        </div>
        
        {/* Reset button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/15">
            <span>Scan Complete</span>
          </div>
          <button 
            onClick={onReset}
            className="px-4 py-1.5 rounded-full text-xs font-medium border border-foreground/10 hover:bg-foreground/5 transition-all cursor-pointer"
          >
            New Analysis
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 mt-8 flex flex-col lg:flex-row gap-8 items-start flex-1">
        
        {/* Left Side: Photo Frame Card */}
        <div className="w-full lg:w-[350px] shrink-0 sticky top-24 space-y-6">
          <div className="glass-panel rounded-3xl p-4 border border-foreground/5 shadow-2xl relative overflow-hidden flex flex-col items-center">
            {/* Visual Mesh Canvas container */}
            <div className="w-full aspect-[3/4] rounded-2xl bg-black border border-foreground/10 relative overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/50 bg-black/40 px-2 py-1 rounded">
                Symmetry: {analysis.symmetry.percentage}%
              </div>
            </div>

            {/* Mesh Controls */}
            <div className="w-full mt-4 flex items-center justify-between px-1">
              <span className="text-xs text-foreground/60 font-medium">Show Facial Landmark Grid</span>
              <button
                onClick={() => setShowMesh(!showMesh)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${showMesh ? 'bg-electric-blue' : 'bg-foreground/10'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${showMesh ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Quick ratings overview */}
          <div className="glass-card rounded-2xl p-5 border border-foreground/5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold font-mono text-foreground/45 uppercase tracking-wider">Face Ratings Dashboard</h3>
            <div className="space-y-2">
              {[
                { label: "Overall Face Rating", value: analysis.ratings.overall },
                { label: "Skin Health", value: analysis.ratings.skin },
                { label: "Wardrobe & Style", value: analysis.ratings.style },
                { label: "Hairstyle & Grooming", value: analysis.ratings.grooming },
                { label: "Confidence Metric", value: analysis.ratings.confidence }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground/75">{item.label}</span>
                    <span className="font-mono">{item.value}/100</span>
                  </div>
                  <div className="w-full bg-foreground/5 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-electric-blue to-cyber-purple" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed analysis tabs */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Tabs Menu */}
          <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-foreground/5 border border-foreground/5">
            {[
              { id: "overview", label: "Overview", icon: Award },
              { id: "face", label: "Facial Geometry", icon: ScanFace },
              { id: "skin", label: "Skin Analysis", icon: Sparkles },
              { id: "hair", label: "Hair & Grooming", icon: Scissors },
              { id: "style", label: "Wardrobe & Stylist", icon: Shirt },
              { id: "plan", label: "30-Day Plan", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-background text-foreground shadow-sm scale-[1.02]" 
                    : "text-foreground/50 hover:text-foreground/70"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 1. OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Face shape hero */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 flex flex-col justify-between h-full col-span-1 md:col-span-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-electric-blue bg-electric-blue/10 px-3 py-1 rounded-full uppercase tracking-wider">Detected Shape</span>
                          <h2 className="font-outfit font-black text-3xl md:text-4xl mt-3">{analysis.face_shape.name}</h2>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold font-mono text-foreground/40 uppercase">Match Score</span>
                          <div className="font-mono text-2xl font-black text-cyber-purple">{analysis.face_shape.score}</div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed mt-4 border-t border-foreground/5 pt-4">
                        {analysis.face_shape.explanation}
                      </p>
                    </div>

                    {/* Skin overall card */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-4">
                      <h3 className="font-outfit font-bold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-rose-500" /> Skin Health Score
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black font-outfit">{analysis.skin_analysis.overall_score}</span>
                        <span className="text-sm text-foreground/40 font-medium">/ 100</span>
                      </div>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        Your skin exhibits high hydration levels and strong barrier function. Minor oiliness is present in the T-zone. Refer to the Skin tab for exact tips.
                      </p>
                      <button 
                        onClick={() => setActiveTab("skin")}
                        className="text-xs text-electric-blue hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        View Full Skincare Plan <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Color undertone card */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-4">
                      <h3 className="font-outfit font-bold text-lg flex items-center gap-2">
                        <Palette className="w-5 h-5 text-emerald-500" /> Personal Color Profile
                      </h3>
                      <div>
                        <span className="text-xs text-foreground/45 uppercase font-mono">Detected Undertone</span>
                        <div className="text-2xl font-black font-outfit mt-0.5">{analysis.color_analysis.undertone}</div>
                      </div>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        {analysis.color_analysis.description} You look stunning in {analysis.color_analysis.colors_to_wear.slice(0, 3).join(", ")}.
                      </p>
                      <button 
                        onClick={() => setActiveTab("style")}
                        className="text-xs text-cyber-purple hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Explore Style & Wardrobe <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Celebrity Match */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 col-span-1 md:col-span-2 space-y-4">
                      <h3 className="font-outfit font-bold text-lg">Celebrity Look-alikes</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {analysis.celebrity_lookalike.map((star: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-sm text-foreground">{star.name}</div>
                              <div className="text-[10px] text-foreground/40 font-mono mt-0.5">{star.reason}</div>
                            </div>
                            <div className="text-right text-sm font-black font-mono text-electric-blue mt-3">{star.similarity} match</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FACIAL GEOMETRY TAB */}
                {activeTab === "face" && (
                  <div className="space-y-6">
                    {/* Symmetry & Jawline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-3">
                        <span className="text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Face Symmetry</span>
                        <div className="text-3xl font-black font-outfit mt-2">{analysis.symmetry.percentage}% Symmetry</div>
                        <p className="text-xs text-foreground/60 leading-relaxed">{analysis.symmetry.description}</p>
                      </div>

                      <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-3">
                        <span className="text-[10px] font-bold font-mono text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Jawline Sharpness</span>
                        <div className="text-3xl font-black font-outfit mt-2">{analysis.jawline.sharpness} Defined</div>
                        <p className="text-xs text-foreground/60 leading-relaxed">{analysis.jawline.description}</p>
                      </div>
                    </div>

                    {/* Features checklist breakdown */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-4">
                      <h3 className="font-outfit font-bold text-lg">Facial Landmarks Breakdown</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "Eyes", shape: analysis.eye_analysis.shape, desc: analysis.eye_analysis.description },
                          { label: "Nose", shape: analysis.nose_analysis.shape, desc: analysis.nose_analysis.description },
                          { label: "Lips", shape: analysis.lip_analysis.shape, desc: analysis.lip_analysis.description },
                          { label: "Eyebrows", shape: analysis.eyebrow_analysis.shape, desc: analysis.eyebrow_analysis.description }
                        ].map((item, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm">{item.label}</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-foreground/10 font-mono text-foreground/75">{item.shape}</span>
                            </div>
                            <p className="text-xs text-foreground/60 leading-relaxed">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SKIN ANALYSIS TAB */}
                {activeTab === "skin" && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">Dermal Scanning Dashboard</h3>
                        <p className="text-xs text-foreground/60 mt-1">Detailed evaluation of surface skin metrics and texture indicators</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/10">
                        <span className="text-xs font-semibold text-rose-500">Overall Score:</span>
                        <span className="font-mono font-bold text-rose-500">{analysis.skin_analysis.overall_score}/100</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {analysis.skin_analysis.metrics.map((metric: any, i: number) => (
                        <div key={i} className="p-5 rounded-2xl glass-card border border-foreground/5 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm">{metric.name}</h4>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              metric.status === "Good" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            }`}>{metric.value}</span>
                          </div>
                          <p className="text-xs text-foreground/60 leading-relaxed">{metric.desc}</p>
                          <div className="border-t border-foreground/5 pt-2.5 mt-2.5">
                            <span className="text-[10px] font-bold text-electric-blue uppercase tracking-wider block">Recommended Care</span>
                            <p className="text-xs text-foreground/75 mt-1">{metric.tips}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. HAIR & GROOMING TAB */}
                {activeTab === "hair" && (
                  <div className="space-y-6">
                    {/* Hair recommendations */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-6">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">Top 10 Hairstyle Matches</h3>
                        <p className="text-xs text-foreground/60 mt-1">Grooming fits selected to balance your face shape boundaries</p>
                      </div>
                      
                      <div className="space-y-4">
                        {analysis.hair_analysis.hairstyles.map((hair: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-electric-blue/10 text-electric-blue flex items-center justify-center font-black font-mono text-sm shrink-0">
                                {i + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-foreground">{hair.name}</h4>
                                <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{hair.why}</p>
                                <div className="flex gap-4 mt-2 text-[10px] text-foreground/45 font-mono uppercase">
                                  <span>Maint: {hair.maintenance}</span>
                                  <span>•</span>
                                  <span>Styling: {hair.difficulty}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-mono font-bold text-foreground/40 block">MATCH RATE</span>
                              <span className="font-mono text-lg font-black text-electric-blue">{hair.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Beard Recommendations (Male) */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-6">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">Beard Contour Suggestions</h3>
                        <p className="text-xs text-foreground/60 mt-1">Recommended jaw structure layouts for beard growth</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analysis.beard_recommendations.map((beard: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 space-y-2">
                            <h4 className="font-bold text-sm">{beard.name}</h4>
                            <p className="text-xs text-foreground/60 leading-relaxed">{beard.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Glasses Matcher */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-6">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">Glasses & Sunglasses Styles</h3>
                        <p className="text-xs text-foreground/60 mt-1">Frames designed to offset forehead width and jaw structure</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {analysis.glasses_recommendations.map((glasses: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Glasses className="w-4 h-4 text-electric-blue" />
                              <h4 className="font-bold text-xs">{glasses.name}</h4>
                            </div>
                            <p className="text-[11px] text-foreground/60 leading-relaxed pt-1">{glasses.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. WARDROBE & STYLIST TAB */}
                {activeTab === "style" && (
                  <div className="space-y-6">
                    {/* Color palette */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-6">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">Personal Color Wardrobe</h3>
                        <p className="text-xs text-foreground/60 mt-1">Colors optimized for your skin tone undertone and high facial contrast</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase">Colors to Wear</span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.color_analysis.colors_to_wear.map((color: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/10">
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] font-bold font-mono text-red-500 uppercase">Colors to Avoid</span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.color_analysis.colors_to_avoid.map((color: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/10">
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Fashion Stylist: Outfit combinations */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-6">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">AI Fashion Stylist</h3>
                        <p className="text-xs text-foreground/60 mt-1">Recommended outfit combinations based on color analysis</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {analysis.outfit_recommendations.map((outfit: any, i: number) => (
                          <div key={i} className="p-5 rounded-2xl bg-foreground/5 border border-foreground/5 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] font-bold font-mono text-cyber-purple bg-cyber-purple/10 px-2 py-0.5 rounded uppercase">{outfit.occasion}</span>
                              <h4 className="font-bold text-sm mt-3">Color Scheme</h4>
                              <p className="text-[10px] text-foreground/50">{outfit.colors}</p>
                              <p className="text-xs text-foreground/70 mt-3 leading-relaxed">{outfit.look}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. 30-DAY PLAN TAB */}
                {activeTab === "plan" && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-4">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">30-Day Glow-Up Routine</h3>
                        <p className="text-xs text-foreground/60 mt-1">Personalized skincare, scaling hygiene, and styling checkpoints</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/5">
                          <span className="text-[10px] font-bold font-mono text-electric-blue uppercase">Daily Water Target</span>
                          <div className="text-lg font-bold font-outfit mt-1">{analysis.glow_up_plan.water_target}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/5">
                          <span className="text-[10px] font-bold font-mono text-cyber-purple uppercase">Daily Sleep Target</span>
                          <div className="text-lg font-bold font-outfit mt-1">{analysis.glow_up_plan.sleep_target}</div>
                        </div>
                      </div>

                      {/* Daily schedule details */}
                      <div className="space-y-3.5 mt-6 border-t border-foreground/5 pt-6">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-amber-500 uppercase">Morning Skincare</span>
                          <p className="text-xs text-foreground/75 leading-relaxed mt-1">{analysis.glow_up_plan.daily_routine.morning_skincare}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold font-mono text-blue-500 uppercase">Night Skincare</span>
                          <p className="text-xs text-foreground/75 leading-relaxed mt-1">{analysis.glow_up_plan.daily_routine.night_skincare}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold font-mono text-purple-500 uppercase">Grooming & Hair Routine</span>
                          <p className="text-xs text-foreground/75 leading-relaxed mt-1">{analysis.glow_up_plan.daily_routine.hair_routine}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase">Diet & Fitness Recommendations</span>
                          <p className="text-xs text-foreground/75 leading-relaxed mt-1">
                            {analysis.glow_up_plan.daily_routine.diet_tips} {analysis.glow_up_plan.daily_routine.fitness}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Weekly calendar checkpoints */}
                    <div className="p-6 rounded-3xl glass-card border border-foreground/5 space-y-6">
                      <div>
                        <h3 className="font-outfit font-bold text-xl">Weekly Timeline Goals</h3>
                        <p className="text-xs text-foreground/60 mt-1">Progress milestones to trace during your 30-day glow-up</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analysis.glow_up_plan.weekly_routine.map((week: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 space-y-2">
                            <span className="text-[10px] font-bold font-mono text-electric-blue uppercase">{week.day}</span>
                            <p className="text-xs text-foreground/75 leading-relaxed mt-1">{week.task}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Floating Chat Assistant trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50 }}
              className="w-[90vw] sm:w-[400px] h-[500px] glass-panel rounded-3xl border border-foreground/10 shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between bg-foreground/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-outfit font-bold text-sm">FaceSense Stylist</span>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded-full hover:bg-foreground/5 text-foreground/45 hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-electric-blue text-white rounded-br-none" 
                          : "bg-foreground/5 border border-foreground/5 text-foreground/80 rounded-bl-none"
                      }`}
                    >
                      {msg.content.split("\n\n").map((para: string, idx: number) => {
                        // Very simple markdown bold parser
                        const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return <p key={idx} className={idx > 0 ? "mt-2" : ""} dangerouslySetInnerHTML={{ __html: formatted }} />;
                      })}
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-foreground/5 border border-foreground/5 text-foreground/80 rounded-bl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3.5 border-t border-foreground/10 flex items-center gap-2 bg-foreground/[0.01]">
                <input
                  type="text"
                  placeholder="Ask about your hairstyles, skincare..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-foreground/5 border border-foreground/5 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-electric-blue/40"
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-2.5 rounded-full bg-electric-blue text-white hover:bg-electric-blue-hover transition-colors shadow-md cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              layoutId="chatbot"
              onClick={() => setChatOpen(true)}
              className="p-4 rounded-full bg-electric-blue text-white hover:bg-electric-blue-hover transition-colors shadow-2xl flex items-center justify-center cursor-pointer group"
            >
              <MessageSquare className="w-6 h-6 group-hover:scale-105 transition-transform" />
              {/* Pulsing indicator */}
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-cyber-purple border-2 border-background animate-ping" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
