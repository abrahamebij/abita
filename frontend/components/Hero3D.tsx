"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment, MeshTransmissionMaterial, ContactShadows, Trail } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function AbitaSymmetricalEscrow() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Rotate the entire structure slowly for a dynamic feel
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }

    // Spin the AI Core independently
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.2;
      coreRef.current.rotation.x += delta * 0.15;
    }

    // Rotate the Escrow Ring & Stakes rapidly to show "processing"
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1.5}>
      <group ref={groupRef}>
        
        {/* 1. THE AI ARBITER CORE */}
        <mesh ref={coreRef}>
          <octahedronGeometry args={[1.2, 0]} />
          {/* Crystalline Glass Material */}
          <MeshTransmissionMaterial 
            backside 
            thickness={2} 
            roughness={0.1} 
            transmission={1} 
            ior={1.4} 
            chromaticAberration={0.05} 
            anisotropy={0.2}
            color="#ffffff"
          />
          {/* Inner Neural Node (Wireframe) */}
          <mesh>
            <octahedronGeometry args={[0.8, 1]} />
            <meshBasicMaterial color="#2563eb" wireframe />
          </mesh>
          {/* Solid Emissive Center */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#2563eb" emissive="#3b82f6" emissiveIntensity={2} />
          </mesh>
        </mesh>

        {/* 2. THE ESCROW RING & SYMMETRICAL STAKES */}
        <group ref={ringRef}>
          {/* The Smart Contract Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.02, 16, 100]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.3} />
          </mesh>

          {/* Stake 1: The Client (Blue) */}
          <mesh position={[2.5, 0, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#2563eb" emissive="#3b82f6" emissiveIntensity={3} />
            <pointLight distance={3} intensity={2} color="#3b82f6" />
          </mesh>

          {/* Stake 2: The Freelancer (Gold/Orange to contrast, or kept Blue for Symmetry) 
              Abita uses #D4A017 for gold accents based on the AGENTS.md spec. */}
          <mesh position={[-2.5, 0, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#D4A017" emissive="#fbbf24" emissiveIntensity={3} />
            <pointLight distance={3} intensity={2} color="#fbbf24" />
          </mesh>
        </group>

      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-[400px] lg:h-[600px] relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2563eb" />
        
        <AbitaSymmetricalEscrow />
        
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={false} /* Let the manual useFrame rotation handle the animation */
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.5}
        />
        <ContactShadows position={[0, -3.5, 0]} opacity={0.2} scale={15} blur={3} far={5} color="#2563eb" />
      </Canvas>
    </div>
  );
}
