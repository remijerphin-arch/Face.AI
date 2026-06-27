"use client";

import React, { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import UploadPage from "@/components/UploadPage";
import ScanningScreen from "@/components/ScanningScreen";
import Dashboard from "@/components/Dashboard";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

type ActiveScreen = "landing" | "upload" | "scanning" | "dashboard" | "error";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("landing");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleStartAnalysis = () => {
    setUploadedImage(null);
    setAnalysisData(null);
    setErrorMsg(null);
    setActiveScreen("upload");
  };

  const handleImageSelected = (base64Image: string) => {
    setUploadedImage(base64Image);
    setActiveScreen("scanning");
  };

  const handleScanComplete = (report: any) => {
    setAnalysisData(report);
    setActiveScreen("dashboard");
  };

  const handleScanFail = (error: string) => {
    setErrorMsg(error);
    setActiveScreen("error");
  };

  const handleReset = () => {
    // Clear in-state photo and data (Privacy-First)
    setUploadedImage(null);
    setAnalysisData(null);
    setErrorMsg(null);
    setActiveScreen("landing");
  };

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col relative bg-background text-foreground transition-colors duration-500">
      {activeScreen === "landing" && (
        <LandingPage 
          onStartAnalysis={handleStartAnalysis}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {activeScreen === "upload" && (
        <UploadPage 
          onImageSelected={handleImageSelected}
          onBack={handleReset}
        />
      )}

      {activeScreen === "scanning" && uploadedImage && (
        <ScanningScreen 
          imageSrc={uploadedImage}
          onScanComplete={handleScanComplete}
          onFail={handleScanFail}
        />
      )}

      {activeScreen === "dashboard" && uploadedImage && analysisData && (
        <Dashboard 
          imageSrc={uploadedImage}
          analysis={analysisData}
          onReset={handleReset}
        />
      )}

      {activeScreen === "error" && (
        <div className="relative min-h-screen flex flex-col justify-center items-center px-4">
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent blur-3xl pointer-events-none" />
          
          <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-red-500/10 text-center shadow-2xl relative">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-6">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            {errorMsg?.includes("No human face detected") || errorMsg?.includes("No face detected") ? (
              <>
                <h2 className="font-outfit font-bold text-xl text-foreground">Face Detection Failed</h2>
                <p className="text-xs text-foreground/60 mt-3 leading-relaxed">
                  We couldn't find a clear human face in the image you provided. Make sure your photo is well-lit, fully visible, not blurry, and shows your face clearly from the front.
                </p>
                <div className="mt-5 p-3 rounded-xl bg-foreground/5 text-left border border-foreground/5 space-y-1.5 font-mono text-[10px] text-foreground/50">
                  <div className="font-bold text-foreground/70 text-red-400">ERROR MESSAGE:</div>
                  <div className="text-red-300/80 leading-relaxed font-sans">{errorMsg}</div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-outfit font-bold text-xl text-foreground">Analysis Connection Lost</h2>
                <p className="text-xs text-foreground/60 mt-3 leading-relaxed">
                  We couldn't connect to the FaceSense AI core. This usually happens if the backend server is not running or is starting up on your system.
                </p>

                <div className="mt-5 p-3 rounded-xl bg-foreground/5 text-left border border-foreground/5 space-y-1.5 font-mono text-[10px] text-foreground/50">
                  <div className="font-bold text-foreground/70">TROUBLESHOOTING:</div>
                  <div>• Ensure the FastAPI server is running on <span className="text-electric-blue">http://localhost:8000</span></div>
                  <div>• Check terminal logs for compile or port conflicts</div>
                  {errorMsg && <div className="text-red-400 mt-2 break-words">LOG: {errorMsg}</div>}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border border-foreground/10 hover:bg-foreground/5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </button>
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setActiveScreen("scanning");
                }}
                className="flex-1 py-3 rounded-xl bg-electric-blue text-white hover:bg-electric-blue-hover text-xs font-semibold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,113,227,0.2)] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
