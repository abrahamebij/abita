"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 py-16 min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl space-y-10"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Abita Platform Demo</h1>
          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Watch the full end-to-end Symmetrical Escrow flow and see the on-chain Somnia AI Arbiter resolve a dispute in real-time.
          </p>
        </div>

        {/* Cinematic Video Container */}
        <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 ring-1 ring-white/10">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/Zs37k8gubA4?si=VO_i8xDtg6U-wFUE" 
            title="Abita Platform Demo" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>

        <div className="flex justify-center pt-4">
          <Link href="/">
            <button className="flex items-center justify-center space-x-3 py-4 px-8 bg-foreground text-background font-bold text-lg rounded-2xl hover:scale-105 hover:shadow-xl hover:shadow-foreground/20 transition-all duration-300 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
              <span>Return to Platform</span>
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
