"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * @notice MarketplaceTeaser Component
 * Teases the V2 vision of Abita's freelance discovery marketplace.
 * Uses harmonious HSL colors, Fraunces serif display, and smooth entry fades.
 */
export default function MarketplaceTeaser() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E2436] bg-[#12151F] p-8 md:p-12">
      {/* Visual background glows */}
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#D4A017] opacity-10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#EF4444] opacity-5 blur-3xl" />

      <div className="max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block rounded-full border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#D4A017]"
        >
          Coming Soon — V2 Vision
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 font-serif text-3xl md:text-4xl tracking-tight text-[#F0F2FF]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Abita Freelance Marketplace
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-base leading-relaxed text-[#6B7280]"
        >
          Where world-class clients discover elite freelance talent. Standardized contracts, 
          automated payment milestones, and integrated AI-arbitrated escrow protect every contract 
          from start to finish. Build and contract with complete peace of mind.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-3 rounded-lg border border-[#1E2436] bg-[#0A0C14] px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-[#D4A017] animate-pulse" />
            <span className="text-sm font-medium text-[#F0F2FF]">Autonomous Matching Engine</span>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-[#1E2436] bg-[#0A0C14] px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span className="text-sm font-medium text-[#F0F2FF]">Reputation-Locked Staking</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
