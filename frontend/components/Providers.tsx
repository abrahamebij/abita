"use client";

import React, { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../lib/config";

/**
 * @notice Providers Component
 * Bootstraps the application state layers by wrapping children in WagmiProvider
 * and TanStack's QueryClientProvider.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // Prevent QueryClient state sharing during Server-Side Rendering (SSR)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // cache for 1 minute
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
