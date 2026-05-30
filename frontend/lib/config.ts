import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

// Define the Somnia Testnet chain configuration using Viem
export const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: {
    name: "Somnia Token",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://dream-rpc.somnia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Shannon Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
});

// Configure wagmi Config
export const config = createConfig({
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(),
  },
});

// Contract deployment address of AbiCore.sol (Abraham: replace with deployed address!)
export const ABICORE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 
