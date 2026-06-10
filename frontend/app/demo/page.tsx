"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-border rounded-3xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary relative z-10">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground relative z-10">Demo Video Rendering...</h1>
        
        <p className="text-muted leading-relaxed relative z-10">
          The full Abita platform demonstration is currently finalizing production. 
          <br /><br />
          <strong>Dear Hackathon Judges:</strong> Please check back in a few hours to see the complete end-to-end Symmetrical Escrow flow and the on-chain AI Arbiter in action!
        </p>

        <div className="pt-6 border-t border-border mt-6 relative z-10">
          <Link href="/">
            <button className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 shadow-md transition-opacity cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Platform</span>
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
