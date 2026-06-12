"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

// Proportions per body type — all values are relative scale units
const PROPORTIONS = {
  Slim: { shoulderW: 0.38, hipW: 0.30, torsoD: 0.16, legR: 0.10, armR: 0.065 },
  Athletic: { shoulderW: 0.48, hipW: 0.38, torsoD: 0.22, legR: 0.13, armR: 0.08 },
  Average: { shoulderW: 0.43, hipW: 0.40, torsoD: 0.20, legR: 0.12, armR: 0.072 },
  "Plus Size": { shoulderW: 0.52, hipW: 0.54, torsoD: 0.28, legR: 0.155, armR: 0.095 },
};

const SKIN = "#d4a574";

function MannequinMesh({ bodyType, topColor, bottomColor, footColor }) {
  const p = PROPORTIONS[bodyType] ?? PROPORTIONS.Average;
  const tc = topColor || "#8b7355";
  const bc = bottomColor || "#4a5568";
  const fc = footColor || "#2d3748";

  return (
    // Group centred so the figure stands at y ≈ 0 when camera looks at origin
    <group position={[0, -0.95, 0]}>
      {/* ── HEAD ─────────────────────────────────────────────── */}
      <mesh position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>

      {/* ── NECK ─────────────────────────────────────────────── */}
      <mesh position={[0, 1.63, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.14, 10]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>

      {/* ── TORSO (shirt) ────────────────────────────────────── */}
      <mesh position={[0, 1.17, 0]}>
        <boxGeometry args={[p.shoulderW, 0.72, p.torsoD]} />
        <meshStandardMaterial color={tc} roughness={0.65} />
      </mesh>

      {/* ── LEFT UPPER ARM ───────────────────────────────────── */}
      <mesh position={[-(p.shoulderW / 2 + p.armR + 0.01), 1.24, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[p.armR, p.armR * 0.88, 0.36, 10]} />
        <meshStandardMaterial color={tc} roughness={0.65} />
      </mesh>

      {/* ── RIGHT UPPER ARM ──────────────────────────────────── */}
      <mesh position={[p.shoulderW / 2 + p.armR + 0.01, 1.24, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[p.armR, p.armR * 0.88, 0.36, 10]} />
        <meshStandardMaterial color={tc} roughness={0.65} />
      </mesh>

      {/* ── LEFT FOREARM ─────────────────────────────────────── */}
      <mesh position={[-(p.shoulderW / 2 + p.armR + 0.03), 0.90, 0]} rotation={[0, 0, 0.07]}>
        <cylinderGeometry args={[p.armR * 0.8, p.armR * 0.68, 0.32, 10]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>

      {/* ── RIGHT FOREARM ────────────────────────────────────── */}
      <mesh position={[p.shoulderW / 2 + p.armR + 0.03, 0.90, 0]} rotation={[0, 0, -0.07]}>
        <cylinderGeometry args={[p.armR * 0.8, p.armR * 0.68, 0.32, 10]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>

      {/* ── HIPS / WAISTBAND ─────────────────────────────────── */}
      <mesh position={[0, 0.63, 0]}>
        <boxGeometry args={[p.hipW, 0.28, p.torsoD * 0.88]} />
        <meshStandardMaterial color={bc} roughness={0.65} />
      </mesh>

      {/* ── LEFT UPPER LEG ───────────────────────────────────── */}
      <mesh position={[-(p.hipW * 0.28), 0.26, 0]}>
        <cylinderGeometry args={[p.legR * 1.08, p.legR, 0.46, 12]} />
        <meshStandardMaterial color={bc} roughness={0.65} />
      </mesh>

      {/* ── RIGHT UPPER LEG ──────────────────────────────────── */}
      <mesh position={[p.hipW * 0.28, 0.26, 0]}>
        <cylinderGeometry args={[p.legR * 1.08, p.legR, 0.46, 12]} />
        <meshStandardMaterial color={bc} roughness={0.65} />
      </mesh>

      {/* ── LEFT LOWER LEG ───────────────────────────────────── */}
      <mesh position={[-(p.hipW * 0.28), -0.22, 0]}>
        <cylinderGeometry args={[p.legR, p.legR * 0.82, 0.44, 12]} />
        <meshStandardMaterial color={fc} roughness={0.6} />
      </mesh>

      {/* ── RIGHT LOWER LEG ──────────────────────────────────── */}
      <mesh position={[p.hipW * 0.28, -0.22, 0]}>
        <cylinderGeometry args={[p.legR, p.legR * 0.82, 0.44, 12]} />
        <meshStandardMaterial color={fc} roughness={0.6} />
      </mesh>

      {/* ── LEFT FOOT ────────────────────────────────────────── */}
      <mesh position={[-(p.hipW * 0.28), -0.49, 0.06]}>
        <boxGeometry args={[0.13, 0.076, 0.26]} />
        <meshStandardMaterial color={fc} roughness={0.55} />
      </mesh>

      {/* ── RIGHT FOOT ───────────────────────────────────────── */}
      <mesh position={[p.hipW * 0.28, -0.49, 0.06]}>
        <boxGeometry args={[0.13, 0.076, 0.26]} />
        <meshStandardMaterial color={fc} roughness={0.55} />
      </mesh>
    </group>
  );
}

export default function StyleAIMannequin({ bodyType = "Average", outfitColors = {} }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 2.6], fov: 48 }}
      style={{ background: "#f8f5f0", borderRadius: "0 1.5rem 1.5rem 0" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 3]} intensity={0.9} castShadow />
      <directionalLight position={[-2, 2, -1]} intensity={0.3} />
      <pointLight position={[0, 3, 2]} intensity={0.2} />

      <Suspense fallback={null}>
        <MannequinMesh
          bodyType={bodyType}
          topColor={outfitColors.top}
          bottomColor={outfitColors.bottom}
          footColor={outfitColors.footwear}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 0.78}
        autoRotate={false}
      />
    </Canvas>
  );
}
