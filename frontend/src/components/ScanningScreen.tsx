"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Cpu } from "lucide-react";
import { getApiUrl } from "@/utils/api";

interface ScanningScreenProps {
  imageSrc: string;
  onScanComplete: (report: any) => void;
  onFail: (error: string) => void;
}

function getSimulated68Points(cx: number, cy: number, scale: number) {
  const points: { x: number; y: number }[] = [];
  const x_scale_adj = 1.0;
  const y_scale_adj = 1.0;

  // 1. Jawline (0-16)
  for (let i = 0; i < 17; i++) {
    const angle = -180 + (i * 180 / 16);
    const rad = angle * Math.PI / 180;
    const x = cx + scale * 0.95 * Math.sin(rad) * 0.9;
    const y = cy + scale * 1.15 * Math.cos(rad) * -0.9 + (i === 8 ? scale * 0.15 : 0);
    points.push({ x, y });
  }

  // 2. Left Eyebrow (17-21)
  for (let i = 0; i < 5; i++) {
    const x = cx - scale * (0.65 - i * 0.1) * x_scale_adj;
    const y = cy - scale * (0.42 + (i < 3 ? i * 0.04 : (4 - i) * 0.04)) * y_scale_adj;
    points.push({ x, y });
  }

  // 3. Right Eyebrow (22-26)
  for (let i = 0; i < 5; i++) {
    const x = cx + scale * (0.25 + i * 0.1) * x_scale_adj;
    const y = cy - scale * (0.42 + (i > 1 ? (4 - i) * 0.04 : i * 0.04)) * y_scale_adj;
    points.push({ x, y });
  }

  // 4. Nose Bridge & Tip (27-35)
  for (let i = 0; i < 4; i++) {
    const x = cx;
    const y = cy - scale * (0.3 - i * 0.1) * y_scale_adj;
    points.push({ x, y });
  }
  for (let i = 0; i < 5; i++) {
    const x = cx - scale * (0.2 - i * 0.1) * x_scale_adj;
    const y = cy + scale * 0.12 * y_scale_adj;
    points.push({ x, y });
  }

  // 5. Left Eye (36-41)
  const eyeLeftCx = cx - scale * 0.42 * x_scale_adj;
  const eyeLeftCy = cy - scale * 0.22 * y_scale_adj;
  const eyePts = [
    [-0.15, 0.0], [-0.07, -0.05], [0.07, -0.05],
    [0.15, 0.0], [0.07, 0.05], [-0.07, 0.05]
  ];
  eyePts.forEach(pt => {
    points.push({ x: eyeLeftCx + pt[0] * scale * x_scale_adj, y: eyeLeftCy + pt[1] * scale * y_scale_adj });
  });

  // 6. Right Eye (42-47)
  const eyeRightCx = cx + scale * 0.42 * x_scale_adj;
  const eyeRightCy = cy - scale * 0.22 * y_scale_adj;
  eyePts.forEach(pt => {
    points.push({ x: eyeRightCx + pt[0] * scale * x_scale_adj, y: eyeRightCy + pt[1] * scale * y_scale_adj });
  });

  // 7. Outer Lips (48-59)
  const lipCx = cx;
  const lipCy = cy + scale * 0.45 * y_scale_adj;
  const outerPts = [
    [-0.3, 0.0], [-0.2, -0.08], [-0.08, -0.12], [0.0, -0.1], [0.08, -0.12], [0.2, -0.08], [0.3, 0.0],
    [0.2, 0.12], [0.08, 0.16], [0.0, 0.15], [-0.08, 0.16], [-0.2, 0.12]
  ];
  outerPts.forEach(pt => {
    points.push({ x: lipCx + pt[0] * scale * x_scale_adj, y: lipCy + pt[1] * scale * y_scale_adj });
  });

  // 8. Inner Lips (60-67)
  const innerPts = [
    [-0.24, 0.0], [-0.1, -0.03], [0.0, -0.02], [0.1, -0.03], [0.24, 0.0],
    [0.1, 0.06], [0.0, 0.07], [-0.1, 0.06]
  ];
  innerPts.forEach(pt => {
    points.push({ x: lipCx + pt[0] * scale * x_scale_adj, y: lipCy + pt[1] * scale * y_scale_adj });
  });

  return points;
}

const STAGES = [
  "Detecting Face Boundary",
  "Facial Landmark Calibration",
  "Face Shape Classification",
  "Skin Texture & Acne Analysis",
  "Symmetry Ratio Calculation",
  "Jawline Contour Tracing",
  "Orbital Pathway Mapping",
  "Nasal Proportions Scaling",
  "Lip Contour Outline mapping",
  "Eyebrow Density Tracking",
  "Hairline & Volume Estimation",
  "Skin Undertone Detection",
  "Color Palette Suitability",
  "Hairstyle Recommendation Match",
  "Beard Alignment Fitting",
  "Outfit Silhouette Coordination",
  "Assembling Tailored AI Report"
];

export default function ScanningScreen({ imageSrc, onScanComplete, onFail }: ScanningScreenProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const apiFetchedRef = useRef(false);
  const apiReportRef = useRef<any>(null);

  // Trigger Backend API Request
  useEffect(() => {
    if (apiFetchedRef.current) return;
    apiFetchedRef.current = true;

    const runAnalysis = async () => {
      try {
        // Convert base64 image to Blob
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        
        // Prepare multipart form data
        const formData = new FormData();
        formData.append("file", blob, "selfie.jpg");

        // Send to FastAPI
        const apiResponse = await fetch(`${getApiUrl()}/api/analyze`, {
          method: "POST",
          body: formData
        });

        if (!apiResponse.ok) {
          const errDetail = await apiResponse.json();
          throw new Error(errDetail.detail || "Failed to analyze face model.");
        }

        const report = await apiResponse.json();
        apiReportRef.current = report;
      } catch (err: any) {
        console.error("Scanning Error:", err);
        onFail(err.message || "An error occurred during facial scan. Check if backend is running.");
      }
    };

    runAnalysis();
  }, [imageSrc, onFail]);

  // Stage Progress Ticker
  useEffect(() => {
    const totalDuration = 6000; // 6 seconds for animation to feel premium & thorough
    const intervalTime = totalDuration / STAGES.length;

    const timer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) {
          setProgress(((prev + 1) / STAGES.length) * 100);
          return prev + 1;
        } else {
          clearInterval(timer);
          setProgress(100);
          
          // Complete: Wait a small moment and trigger scan completion
          setTimeout(() => {
            if (apiReportRef.current) {
              onScanComplete(apiReportRef.current);
            } else {
              // Wait a bit longer if API is still pending
              const checkApi = setInterval(() => {
                if (apiReportRef.current) {
                  clearInterval(checkApi);
                  onScanComplete(apiReportRef.current);
                }
              }, 250);
            }
          }, 400);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onScanComplete]);

  // Canvas Face Mesh Draw loop
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    imageRef.current = img;
    
    let animationFrameId: number;
    let scanY = 0;
    let scanDirection = 1;
    let morphProgress = 0;

    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas || !imageRef.current) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imageRef.current;
      const cw = canvas.width = canvas.clientWidth;
      const ch = canvas.height = canvas.clientHeight;
      
      ctx.clearRect(0, 0, cw, ch);
      
      // Calculate drawing dimensions to cover / center image
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
      
      // Draw base image slightly darkened for neon contrast
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.fillStyle = "rgba(5, 5, 7, 0.4)";
      ctx.fillRect(0, 0, cw, ch);

      // Draw Face Mesh wireframe (Simulated coordinates adapting to frame)
      const cx = cw / 2;
      const cy = ch * 0.48;
      const scale = Math.min(cw, ch) * 0.28;
      
      const simulatedPoints = getSimulated68Points(cx, cy, scale);
      let points = simulatedPoints;

      // If backend report has arrived, dynamically transition points to the real face coordinates
      if (apiReportRef.current && apiReportRef.current.landmarks) {
        morphProgress = Math.min(1.0, morphProgress + 0.03); // Increment morph frame-by-frame
        
        const realLandmarks = apiReportRef.current.landmarks;
        const scaleX = dw / img.width;
        const scaleY = dh / img.height;
        
        const mappedRealPoints = realLandmarks.map((pt: any) => {
          return {
            x: dx + pt.x * scaleX,
            y: dy + pt.y * scaleY
          };
        });

        // Interpolate between centered simulated points and real mapped coordinates
        points = simulatedPoints.map((simPt, idx) => {
          const realPt = mappedRealPoints[idx] || simPt;
          return {
            x: simPt.x + (realPt.x - simPt.x) * morphProgress,
            y: simPt.y + (realPt.y - simPt.y) * morphProgress
          };
        });
      }

      // RENDER CONNECTIONS (only if we've passed landmark stage)
      if (currentStageIndex >= 1) {
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = "rgba(0, 113, 227, 0.25)";
        
        // Draw triangulation lines based on distance to simulate 3D mesh
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
            if (dist < scale * 0.35) {
              ctx.beginPath();
              ctx.moveTo(points[i].x, points[i].y);
              ctx.lineTo(points[j].x, points[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw primary outlines
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = "rgba(161, 0, 255, 0.4)";
        
        // Jawline Outline (0-16)
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < 17; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.stroke();

        // Left Eye (36-41)
        ctx.beginPath();
        ctx.moveTo(points[36].x, points[36].y);
        for (let i = 37; i < 42; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.stroke();

        // Right Eye (42-47)
        ctx.beginPath();
        ctx.moveTo(points[42].x, points[42].y);
        for (let i = 43; i < 48; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.stroke();

        // Lips Outer (48-59)
        ctx.beginPath();
        ctx.moveTo(points[48].x, points[48].y);
        for (let i = 49; i < 60; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.stroke();
      }

      // RENDER LANDMARK NODES (if passed stage 1)
      if (currentStageIndex >= 1) {
        points.forEach((pt, idx) => {
          // Pulse intensity based on index and time
          const pulse = Math.sin(Date.now() * 0.008 + idx) * 0.4 + 0.6;
          
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI);
          ctx.fillStyle = idx % 2 === 0 ? `rgba(0, 113, 227, ${pulse})` : `rgba(161, 0, 255, ${pulse})`;
          ctx.fill();
        });
      }

      // Draw Laser bar sweep
      scanY += 3.2 * scanDirection;
      if (scanY > ch || scanY < 0) {
        scanDirection *= -1;
      }
      
      const gradient = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
      gradient.addColorStop(0, "rgba(0, 113, 227, 0)");
      gradient.addColorStop(0.5, "rgba(0, 113, 227, 0.8)");
      gradient.addColorStop(1, "rgba(0, 113, 227, 0)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 10, cw, 20);

      // Accent laser lines
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(cw, scanY);
      ctx.strokeStyle = "rgba(161, 0, 255, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(161, 0, 255, 0.8)";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      animationFrameId = requestAnimationFrame(renderCanvas);
    };

    img.onload = () => {
      renderCanvas();
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentStageIndex, imageSrc]);

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center px-4 py-8">
      {/* Background gradients */}
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-radial from-blue-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-radial from-cyber-purple/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Glass card frame */}
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 md:p-8 border border-foreground/5 shadow-2xl flex flex-col lg:flex-row gap-8 items-center z-10">
        
        {/* Left Side: Scanning Preview */}
        <div className="w-full lg:w-[48%] aspect-square max-w-[360px] rounded-2xl border border-foreground/10 bg-black relative overflow-hidden shadow-2xl shrink-0">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />
          {/* Overlay glow corners */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-electric-blue" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-electric-blue" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-electric-blue" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-electric-blue" />
        </div>

        {/* Right Side: Scan Stages Console */}
        <div className="flex-1 w-full flex flex-col justify-between py-2 text-left h-full">
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-electric-blue/10 text-electric-blue uppercase tracking-widest border border-electric-blue/10">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> Active Facial Scanning
            </span>
            <h2 className="font-outfit font-bold text-2xl mt-3">Analyzing Your Face...</h2>
            <p className="text-xs text-foreground/55 mt-1 leading-relaxed">
              Extracting structural vectors, dermal properties, and color harmonies in volatile sandbox memory.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden mb-6 relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-electric-blue to-cyber-purple"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          {/* Stage Logs list */}
          <div className="h-52 overflow-y-auto pr-2 space-y-2.5 relative select-none">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isActive = idx === currentStageIndex;
              
              return (
                <div 
                  key={idx}
                  className={`flex items-center justify-between text-xs transition-colors py-1 ${
                    isActive ? "text-foreground font-semibold" : isCompleted ? "text-foreground/40" : "text-foreground/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status marker */}
                    {isCompleted ? (
                      <span className="w-4 h-4 rounded-full border border-emerald-500 bg-emerald-500/10 flex items-center justify-center text-[8px] font-bold text-emerald-500">✓</span>
                    ) : isActive ? (
                      <span className="w-4 h-4 rounded-full border border-electric-blue flex items-center justify-center relative">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-ping" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-foreground/10 flex items-center justify-center" />
                    )}
                    <span>{stage}</span>
                  </div>

                  {isActive && (
                    <span className="text-[10px] text-electric-blue font-mono font-bold animate-pulse">
                      PROCESSING...
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-[10px] text-emerald-500 font-mono font-medium">
                      DONE
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-foreground/5 text-[10px] text-foreground/45 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-electric-blue shrink-0" />
            <span>Secure Scan Mode: Memory will be wiped automatically on task termination.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
