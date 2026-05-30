"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";

interface DeliveryFormProps {
  onSubmit: (deliveryNote: string) => void;
  isPending: boolean;
}

/**
 * @notice DeliveryForm Component
 * Allows freelancers to submit delivery proof (delivery notes, links).
 */
export default function DeliveryForm({ onSubmit, isPending }: DeliveryFormProps) {
  const [deliveryNote, setDeliveryNote] = useState("");

  const handleSubmit = () => {
    if (deliveryNote.trim().length >= 5) {
      onSubmit(deliveryNote);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-8 space-y-4 shadow-sm"
    >
      <h3 className="text-xl font-bold text-foreground">
        Submit Completed Work
      </h3>
      <textarea
        disabled={isPending}
        placeholder="Describe your delivery. Link Figma files, Github repos, or attach proofs..."
        value={deliveryNote}
        onChange={(e) => setDeliveryNote(e.target.value)}
        rows={4}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none transition-all duration-300 resize-none"
      />
      <motion.button
        disabled={isPending || deliveryNote.trim().length < 5}
        onClick={handleSubmit}
        className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-card hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
      >
        {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
        <span>Submit Delivery Note</span>
      </motion.button>
    </motion.div>
  );
}
