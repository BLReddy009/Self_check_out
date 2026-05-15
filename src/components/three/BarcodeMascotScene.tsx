"use client";

import { Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";

function BarcodeBars() {
  const groupRef = useRef<Group>(null);
  const bars = useMemo(
    () => [0.12, 0.34, 0.18, 0.5, 0.22, 0.42, 0.14, 0.3, 0.48, 0.2, 0.38, 0.16],
    []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.42;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.65) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[2.25, 1.18, 0.08]} />
        <MeshTransmissionMaterial
          backside
          chromaticAberration={0.04}
          color="#e9fff8"
          distortion={0.18}
          roughness={0.1}
          thickness={0.45}
          transmission={0.72}
        />
      </mesh>
      {bars.map((width, index) => {
        const x = -0.92 + index * 0.17;
        const height = 0.68 + (index % 3) * 0.16;
        const color = index % 4 === 0 ? "#FF6B5E" : index % 3 === 0 ? "#F7D84B" : "#2BE7A7";

        return (
          <mesh key={`${width}-${index}`} position={[x, 0, 0.02]}>
            <boxGeometry args={[width, height, 0.08]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.45} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.78, 0.04]}>
        <torusGeometry args={[0.48, 0.018, 12, 80]} />
        <meshStandardMaterial color="#8DEBFF" emissive="#8DEBFF" emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

export function BarcodeMascotScene() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.25, 4.6], fov: 42 }} dpr={[1, 1.8]}>
        <color attach="background" args={["#101417"]} />
        <ambientLight intensity={1.25} />
        <pointLight color="#2BE7A7" intensity={18} position={[2.4, 2.2, 2.4]} />
        <pointLight color="#FF6B5E" intensity={12} position={[-2.2, -0.5, 1.8]} />
        <Float floatIntensity={1.5} rotationIntensity={0.22} speed={2}>
          <BarcodeBars />
        </Float>
        <Sparkles color="#F7D84B" count={42} opacity={0.7} scale={[4.6, 2.6, 1.6]} size={2.2} speed={0.35} />
      </Canvas>
    </div>
  );
}
