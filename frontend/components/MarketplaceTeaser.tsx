"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * @notice MarketplaceTeaser Component
 * Teases the V2 vision of Abita's freelance discovery marketplace.
 * Configured in a light slate theme with pure blue accents.
 */
export default function MarketplaceTeaser() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12 shadow-sm">
      {/* Visual background glow (blue accent only) */}
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary opacity-5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary opacity-5 blur-3xl" />

      <div className="max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block rounded-full border border-primary/20 bg-primary-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Coming Soon — V2 Vision
        </motion.div>

        <h2 
          className="mt-6 text-3xl md:text-4xl tracking-tight text-foreground font-bold"
        >
          Abita Freelance Marketplace
        </h2>

        <p className="mt-4 text-base leading-relaxed text-muted">
          Where world-class clients discover elite freelance talent. Standardized contracts, 
          automated payment milestones, and integrated AI-arbitrated escrow protect every contract 
          from start to finish. Build and contract with complete peace of mind.
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-3 rounded-lg border border-border bg-background px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">Autonomous Matching Engine</span>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border border-border bg-background px-5 py-3">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-foreground">Reputation-Locked Staking</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
