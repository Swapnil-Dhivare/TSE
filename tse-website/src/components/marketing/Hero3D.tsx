import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import type { Group, Mesh } from "three";

function DistortedBlob() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const { pointer, clock } = state;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.15 + pointer.x * 0.4;
    meshRef.current.rotation.x = pointer.y * 0.25;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.6, 8]} />
        <MeshDistortMaterial
          color="#c9c9d2"
          emissive="#4a4560"
          emissiveIntensity={0.35}
          roughness={0.08}
          metalness={0.65}
          distort={0.42}
          speed={2.2}
        />
      </mesh>
    </Float>
  );
}

function OrbitingSatellites() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.35;
    groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[2.6, 0.4, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#8b7cf6" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-2.3, -0.6, 0.8]}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color="#e8e8ee" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0.2, 2.1, -0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 3, 3]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-3, -2, -3]} intensity={1.4} color="#8b7cf6" />
      <Environment preset="city" environmentIntensity={0.9} />
      <Sparkles count={70} scale={5.5} size={2.5} speed={0.3} color="#e8e8ee" opacity={0.9} />
      <DistortedBlob />
      <OrbitingSatellites />
    </Canvas>
  );
}
