"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

type MouseRef = React.RefObject<[number, number]>;

// ── Instanced particle field ──────────────────────────────────────
function Particles({ count = 300 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.003,
        ),
        scale: Math.random() * 0.04 + 0.01,
      })),
    [count],
  );

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    data.forEach((p, i) => {
      p.position.add(p.velocity);
      if (Math.abs(p.position.x) > 10) p.velocity.x *= -1;
      if (Math.abs(p.position.y) > 6) p.velocity.y *= -1;
      if (Math.abs(p.position.z) > 4) p.velocity.z *= -1;
      dummy.position.copy(p.position);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#00eaff" transparent opacity={0.55} />
    </instancedMesh>
  );
}

// ── Volumetric light beams ────────────────────────────────────────
function LightBeams() {
  const group = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
  });
  return (
    <group ref={group}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-4 + i * 4, 4, -3]} rotation={[0, 0, (i - 1) * 0.2]}>
          <coneGeometry args={[0.06, 10, 8, 1, true]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0.035} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ── Camera parallax via mouse ─────────────────────────────────────
function CameraRig({ mouse }: { mouse: MouseRef }) {
  const { camera } = useThree();

  useFrame(() => {
    const [mouseX, mouseY] = mouse.current ?? [0, 0];
    camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.04;
    camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Main exported scene ───────────────────────────────────────────
export default function ThreeScene({
  mouseRef,
}: {
  mouseRef: MouseRef;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#04060a"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 4, 2]} color="#00eaff" intensity={0.6} />
      <pointLight position={[-5, -3, 1]} color="#0044aa" intensity={0.4} />

      <Particles count={280} />
      <LightBeams />
      <CameraRig mouse={mouseRef} />

      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.ADD}
        />
        <DepthOfField focusDistance={0} focalLength={0.04} bokehScale={1.2} />
        <Vignette eskil={false} offset={0.3} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
