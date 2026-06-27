"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, FileImage, ShieldCheck, X, RefreshCw, AlertCircle } from "lucide-react";

interface UploadPageProps {
  onImageSelected: (base64Image: string) => void;
  onBack: () => void;
}

export default function UploadPage({ onImageSelected, onBack }: UploadPageProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp", "heic"];

    if (!validTypes.includes(file.type) && !validExts.includes(ext || "")) {
      setDragError("Unsupported file format. Please upload JPG, PNG, WEBP, or HEIC.");
      return;
    }

    setDragError(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onImageSelected(reader.result);
      }
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check permissions or upload a photo instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      // Crop to a square to look like a premium avatar
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Center the crop
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        
        stopCamera();
        onImageSelected(dataUrl);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center px-4 py-8">
      {/* Background blur layers */}
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-radial from-blue-500/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-radial from-cyber-purple/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Main glass box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl glass-panel rounded-3xl p-8 relative z-10 border border-foreground/5 shadow-2xl"
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-sm text-foreground/55 hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <X className="w-4 h-4" /> Cancel
        </button>

        <div className="text-center mt-6 mb-8">
          <h2 className="font-outfit font-bold text-2xl tracking-tight">Upload Your Photo</h2>
          <p className="text-sm text-foreground/60 mt-1">Take a live selfie or upload an image to begin face analysis</p>
        </div>

        <AnimatePresence mode="wait">
          {!isCameraActive ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Drag/Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                  isDragActive 
                    ? "border-electric-blue bg-electric-blue/5 scale-[0.99]" 
                    : "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/[0.01]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  className="hidden"
                />
                
                <div className="p-4 rounded-full bg-foreground/5 text-foreground/75">
                  <Upload className="w-8 h-8" />
                </div>
                
                <div className="text-center">
                  <p className="font-semibold text-sm">Drag & drop your photo here</p>
                  <p className="text-xs text-foreground/40 mt-1">or click to browse from files</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center text-[10px] text-foreground/45 mt-2 bg-foreground/5 px-3 py-1.5 rounded-full font-mono uppercase">
                  <span>JPG</span>•<span>PNG</span>•<span>HEIC</span>•<span>WEBP</span>
                </div>
              </div>

              {dragError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 text-red-500 text-xs flex items-center gap-2 border border-red-500/15">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{dragError}</span>
                </div>
              )}

              {/* Camera Activation Button */}
              <div className="flex items-center justify-center">
                <div className="w-full h-[1px] bg-foreground/10 flex-1" />
                <span className="text-[10px] text-foreground/45 px-4 font-mono font-bold uppercase tracking-wider">OR</span>
                <div className="w-full h-[1px] bg-foreground/10 flex-1" />
              </div>

              <button
                onClick={startCamera}
                className="w-full py-4 rounded-xl border border-foreground/10 hover:bg-foreground/5 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-electric-blue" />
                Use Live Camera
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Webcam viewbox */}
              <div className="w-full aspect-square max-w-[340px] rounded-2xl border border-foreground/10 bg-black relative overflow-hidden shadow-inner">
                {/* Overlay face crop outline */}
                <div className="absolute inset-0 border-[3px] border-dashed border-electric-blue/30 rounded-full m-8 pointer-events-none animate-pulse-slow">
                  {/* Floating guide corners */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-[10px] text-electric-blue font-bold tracking-widest font-mono uppercase bg-black/40 px-3 py-1 rounded-full border border-electric-blue/20">
                    Align Face
                  </div>
                </div>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              </div>

              {/* Camera Action Buttons */}
              <div className="flex gap-4 w-full max-w-[340px]">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3.5 rounded-xl border border-foreground/10 hover:bg-foreground/5 text-sm font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={captureSelfie}
                  className="flex-[2] py-3.5 rounded-xl bg-electric-blue text-white hover:bg-electric-blue-hover text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,113,227,0.3)] cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> Capture Photo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {cameraError && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 text-red-500 text-xs flex items-start gap-2.5 border border-red-500/15">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Volatile session warning */}
        <div className="mt-8 pt-6 border-t border-foreground/5 flex items-start gap-3 text-xs text-foreground/45">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-foreground/75">Privacy Secured:</span> Your image is converted directly to volatile byte arrays, analyzed in-memory on the backend, and instantly destroyed. No cookies, no history, no persistence.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
