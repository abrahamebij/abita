"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment, MeshTransmissionMaterial, ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// A single glowing data packet traveling along a curve
function DataPacket({ curve, color, speed = 0.5, delay = 0 }: { curve: THREE.QuadraticBezierCurve3, color: string, speed?: number, delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = ((state.clock.elapsedTime * speed) + delay) % 1.0;
    // Get position on curve
    const position = curve.getPoint(t);
    meshRef.current.position.copy(position);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} />
      <pointLight distance={2} intensity={1.5} color={color} />
    </mesh>
  );
}

// A glass tube representing the smart contract connection
function DataTube({ curve }: { curve: THREE.QuadraticBezierCurve3 }) {
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.03, 8, false), [curve]);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#94a3b8" transparent opacity={0.15} />
    </mesh>
  );
}

function ArbitrationNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const judgeRef = useRef<THREE.Mesh>(null);

  // Define the node positions
  const posJudge = useMemo(() => new THREE.Vector3(0, 2, 0), []);
  const posClient = useMemo(() => new THREE.Vector3(-3.5, -1.5, 0), []);
  const posFreelancer = useMemo(() => new THREE.Vector3(3.5, -1.5, 0), []);

  // Define the curves for the data pipes (bowing outward for a wider base)
  const curveClient = useMemo(() => new THREE.QuadraticBezierCurve3(
    posClient,
    new THREE.Vector3(-2, 0, 2), 
    posJudge
  ), [posClient, posJudge]);

  const curveFreelancer = useMemo(() => new THREE.QuadraticBezierCurve3(
    posFreelancer,
    new THREE.Vector3(2, 0, 2), 
    posJudge
  ), [posFreelancer, posJudge]);

  useFrame((state, delta) => {
    // Slowly rotate the entire network for a monumental feel
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
    // Spin the AI Judge core rapidly
    if (judgeRef.current) {
      judgeRef.current.rotation.y -= delta * 0.4;
      judgeRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={1.2}>
      <group ref={groupRef}>
        
        {/* 1. THE AI JUDGE (Apex Node) */}
        <mesh position={posJudge} ref={judgeRef}>
          <icosahedronGeometry args={[1.2, 0]} />
          <MeshTransmissionMaterial 
            backside 
            thickness={2} 
            roughness={0.05} 
            transmission={1} 
            ior={1.4} 
            chromaticAberration={0.08} 
            anisotropy={0.3}
            color="#ffffff"
          />
          {/* Inner glowing core of the judge */}
          <mesh>
            <icosahedronGeometry args={[0.7, 1]} />
            <meshBasicMaterial color="#3b82f6" wireframe />
          </mesh>
          <mesh>
             <sphereGeometry args={[0.2, 16, 16]} />
             <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={2} />
          </mesh>
        </mesh>

        {/* 2. THE CLIENT NODE (Left) */}
        <mesh position={posClient}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          <mesh>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.2} />
          </mesh>
        </mesh>

        {/* 3. THE FREELANCER NODE (Right) */}
        <mesh position={posFreelancer}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          <mesh>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshBasicMaterial color="#D4A017" wireframe transparent opacity={0.2} />
          </mesh>
        </mesh>

        {/* 4. THE DATA PIPES (Glass Tubes) */}
        <DataTube curve={curveClient} />
        <DataTube curve={curveFreelancer} />

        {/* 5. THE DATA FLOW (Arguments and Stakes traveling to the Judge) */}
        {/* Client sending 1 STT and arguments (Blue) */}
        <DataPacket curve={curveClient} color="#3b82f6" speed={0.3} delay={0} />
        <DataPacket curve={curveClient} color="#60a5fa" speed={0.3} delay={0.15} />
        <DataPacket curve={curveClient} color="#93c5fd" speed={0.3} delay={0.3} />
        
        {/* Freelancer sending 1 STT and arguments (Gold) */}
        <DataPacket curve={curveFreelancer} color="#D4A017" speed={0.3} delay={0.5} />
        <DataPacket curve={curveFreelancer} color="#fbbf24" speed={0.3} delay={0.65} />
        <DataPacket curve={curveFreelancer} color="#fcd34d" speed={0.3} delay={0.8} />

      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-[500px] lg:h-[700px] relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.5, 10], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <spotLight position={[0, 10, 5]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" />
        <pointLight position={[0, 2, 0]} intensity={2} color="#3b82f6" distance={6} />
        
        <ArbitrationNetwork />
        
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={false}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 2 - 0.4}
        />
        <ContactShadows position={[0, -4, 0]} opacity={0.3} scale={25} blur={2.5} far={6} color="#0f172a" />
      </Canvas>
    </div>
  );
}
