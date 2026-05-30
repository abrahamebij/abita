"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * @notice Premium Custom Logo for Abita
 * Combines:
 * 1. Symmetrical Balance Scales of Justice (Arbiter)
 * 2. High-Tech Symmetrical neural network nodes (AI Judge)
 * 3. Symmetrical geometric Capital "A" frame (Abita Branding)
 */
export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-primary"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Plumb-line of Absolute Equity / Neural Core Axis */}
        <line
          x1="50"
          y1="15"
          x2="50"
          y2="85"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          className="opacity-40"
        />

        {/* Left & Right Symmetrical Hanging Strings for the Scales */}
        <path
          d="M 20,62 L 32.5,45 M 45,62 L 32.5,45"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-50"
        />
        <path
          d="M 55,62 L 67.5,45 M 80,62 L 67.5,45"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-50"
        />

        {/* Scale Symmetrical Balance Trays */}
        <path
          d="M 20,62 H 45"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 55,62 H 80"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Main Geometric "A" Frame / Structural Balance Beam */}
        <path
          d="M 50,15 L 18,78"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 50,15 L 82,78"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Horizontal Balance Crossbeam (Scale Pivot) */}
        <path
          d="M 32.5,45 H 67.5"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Symmetrical Base Foundation Anchor */}
        <path
          d="M 38,82 H 62"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="opacity-70"
        />

        {/* Neural Network Vertices (Glowing AI Nodes) */}
        {/* Left Node */}
        <circle cx="32.5" cy="45" r="4.5" fill="currentColor" />
        
        {/* Right Node */}
        <circle cx="67.5" cy="45" r="4.5" fill="currentColor" />

        {/* Center Plumb weight */}
        <circle cx="50" cy="82" r="3.5" fill="currentColor" />

        {/* Symmetrical Settle Trays center indicators */}
        <circle cx="32.5" cy="62" r="2.5" fill="currentColor" />
        <circle cx="67.5" cy="62" r="2.5" fill="currentColor" />

        {/* Symmetrical Neural Apex (AI Supreme Arbitrator Vertex) */}
        <circle cx="50" cy="15" r="6" fill="currentColor" />
        
        {/* Pulsating Consensus Ring */}
        <circle
          cx="50"
          cy="15"
          r="11"
          stroke="currentColor"
          strokeWidth="1.5"
          className="animate-ping"
          style={{
            transformOrigin: "50px 15px",
            opacity: 0.4,
          }}
        />
      </svg>
    </motion.div>
  );
}
