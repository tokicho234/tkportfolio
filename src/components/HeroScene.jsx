'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const NODES = 90;
const RADIUS = 2.3;
const LINK_DIST = 1.25;

function Network({ color }) {
  const group = useRef();
  const ring = useRef();

  const { points, lines } = useMemo(() => {
    const pts = [];
    for (let i = 0; i < NODES; i++) {
      // uniform point inside a sphere
      const u = Math.random(), v = Math.random(), w = Math.random();
      const theta = 2 * Math.PI * u, phi = Math.acos(2 * v - 1), r = RADIUS * Math.cbrt(w);
      pts.push([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)]);
    }
    const seg = [];
    for (let i = 0; i < NODES; i++)
      for (let j = i + 1; j < NODES; j++) {
        const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], dz = pts[i][2] - pts[j][2];
        if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) seg.push(...pts[i], ...pts[j]);
      }
    return { points: new Float32Array(pts.flat()), lines: new Float32Array(seg) };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    g.rotation.y += delta * 0.18;
    g.rotation.x += (state.pointer.y * 0.35 - g.rotation.x) * 0.04;
    g.position.x += (state.pointer.x * 0.3 - g.position.x) * 0.04;
    ring.current.rotation.z += delta * 0.3;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.07} sizeAttenuation transparent opacity={0.95} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.28} />
      </lineSegments>
      <mesh>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring} rotation={[1.1, 0.3, 0]}>
        <torusGeometry args={[1.9, 0.01, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export default function HeroScene({ color = '#22d3ee' }) {
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }} aria-hidden="true">
      <Network color={color} />
    </Canvas>
  );
}
