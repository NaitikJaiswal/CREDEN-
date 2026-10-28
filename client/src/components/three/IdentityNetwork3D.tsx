import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

export interface NodeInfo {
  id: string;
  name: string;
  code: string;
  recordsSubmitted: number;
  passRate: number;
  status: string;
  position: [number, number, number];
  color: string;
}

const INSTITUTION_NODES: NodeInfo[] = [
  { id: '1', name: 'COEP Tech University', code: 'AICTE-MH-1029', recordsSubmitted: 128, passRate: 98.4, status: 'VERIFIED', position: [2.5, 1.2, 1.5], color: '#FFFFFF' },
  { id: '2', name: 'IIT Delhi', code: 'AICTE-DL-2001', recordsSubmitted: 145, passRate: 99.1, status: 'VERIFIED', position: [-2.2, 1.8, -1.0], color: '#D4D4D8' },
  { id: '3', name: 'RV College of Engineering', code: 'AICTE-KA-3042', recordsSubmitted: 110, passRate: 94.5, status: 'REVIEW PENDING', position: [1.8, -2.0, 1.2], color: '#FBBF24' },
  { id: '4', name: 'Anna University (CEG)', code: 'AICTE-TN-4010', recordsSubmitted: 160, passRate: 97.8, status: 'VERIFIED', position: [-2.6, -1.2, 1.4], color: '#36D399' },
  { id: '5', name: 'VJTI Mumbai', code: 'AICTE-MH-1002', recordsSubmitted: 118, passRate: 96.2, status: 'VERIFIED', position: [0.5, 2.6, -1.6], color: '#FFFFFF' },
  { id: '6', name: 'Jadavpur University', code: 'AICTE-WB-5001', recordsSubmitted: 104, passRate: 95.0, status: 'VERIFIED', position: [-1.4, 0.4, 2.6], color: '#A1A1AA' },
  { id: '7', name: 'Thapar Institute', code: 'AICTE-PB-6020', recordsSubmitted: 95, passRate: 93.8, status: 'VERIFIED', position: [2.8, -0.6, -1.8], color: '#36D399' },
  { id: '8', name: 'DTU Delhi', code: 'AICTE-DL-2015', recordsSubmitted: 135, passRate: 98.0, status: 'VERIFIED', position: [-0.8, -2.4, -1.5], color: '#E4E4E7' },
];

// 1. Central Core Glowing Academic Identity Node (Monochrome Metallic Titanium on Pure Black)
function CentralIdentityNode() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x += delta * 0.35;
      ringRef1.current.rotation.y += delta * 0.25;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y -= delta * 0.4;
      ringRef2.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Identity Core */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.85, 0]} />
        <meshBasicMaterial color="#FFFFFF" wireframe={false} />
      </mesh>

      {/* Outer Wireframe Core */}
      <mesh>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshBasicMaterial color="#737373" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Rotating Data Ring 1 */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.5, 0.02, 6, 36]} />
        <meshBasicMaterial color="#E5E5E5" transparent opacity={0.6} />
      </mesh>

      {/* Rotating Data Ring 2 */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.8, 0.015, 6, 36]} />
        <meshBasicMaterial color="#737373" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// 2. Translucent Digital Holographic Globe
function HolographicGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[3.1, 16, 16]} />
      <meshBasicMaterial
        color="#262626"
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
}

// 3. Consolidated Institutional Nodes Group
function InstitutionalNodesGroup({
  onSelectNode,
  selectedNodeId,
}: {
  onSelectNode: (node: NodeInfo) => void;
  selectedNodeId?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  const linesGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const center = new THREE.Vector3(0, 0, 0);

    for (const node of INSTITUTION_NODES) {
      points.push(center);
      points.push(new THREE.Vector3(...node.position));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Animated Connection Lines to Center */}
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial color="#525252" transparent opacity={0.4} />
      </lineSegments>

      {/* Institutional Nodes */}
      {INSTITUTION_NODES.map((node) => {
        const isSelected = selectedNodeId === node.id;
        return (
          <group
            key={node.id}
            position={node.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(node);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Outer Glow Halo */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.32 : 0.2, 10, 10]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={isSelected ? 0.7 : 0.3}
              />
            </mesh>

            {/* Solid Node Core */}
            <mesh>
              <sphereGeometry args={[0.13, 10, 10]} />
              <meshBasicMaterial color={node.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 4. Main Canvas Scene
export const IdentityNetwork3D: React.FC<{
  onSelectNode: (node: NodeInfo | null) => void;
  selectedNode: NodeInfo | null;
}> = ({ onSelectNode, selectedNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing bg-black">
      {isVisible ? (
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 45 }}
          dpr={[1, 1.25]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 10, 5]} intensity={1.8} color="#FFFFFF" />

          {/* Neutral white stars */}
          <Stars radius={40} depth={20} count={600} factor={3} saturation={0} speed={0.8} />

          <CentralIdentityNode />
          <HolographicGlobe />
          <InstitutionalNodesGroup
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNode?.id}
          />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.6}
          />
        </Canvas>
      ) : (
        <div className="w-full h-full bg-black" />
      )}
    </div>
  );
};
