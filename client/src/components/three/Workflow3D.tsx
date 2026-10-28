import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface WorkflowStage {
  id: number;
  name: string;
  shortName: string;
  purpose: string;
  inputData: string;
  processing: string;
  outputGenerated: string;
  position: [number, number, number];
  color: string;
  geometryType: 'box' | 'cylinder' | 'octahedron' | 'dodecahedron' | 'torus' | 'icosahedron';
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 1,
    name: '1. Institution Data Submission',
    shortName: 'Submission',
    purpose: 'AICTE-approved institutions submit student-level enrolments annually or by semester.',
    inputData: 'CSV/XLSX bulk uploads or API payloads containing student names, programme codes, APAAR IDs.',
    processing: 'Client & server sanitization, file schema validation, row limits, batch ID allocation.',
    outputGenerated: 'Immutable import batch record with submission timestamp and checksum.',
    position: [-5.0, 0, 0],
    color: '#00F0FF', // Electric Neon Cyan
    geometryType: 'box',
  },
  {
    id: 2,
    name: '2. APAAR Identity Validation',
    shortName: 'APAAR Validation',
    purpose: 'Validates 12-digit academic identifier format and matches against authoritative national fixtures.',
    inputData: 'Raw APAAR string, student legal name, date of birth year.',
    processing: 'Layer 1 format check (leading zeros, 12 digits), Layer 3 authoritative gateway adapter.',
    outputGenerated: 'Cryptographic HMAC-SHA256 fingerprint, masked identifier (•••• •••• 9012), verification status.',
    position: [-3.0, 0.45, 0],
    color: '#8B5CF6', // Radiant Violet Purple
    geometryType: 'octahedron',
  },
  {
    id: 3,
    name: '3. Data Quality & Duplicate Detection',
    shortName: 'Duplicate Engine',
    purpose: 'Intelligent rule-based detection to distinguish concurrent enrolments from legitimate academic pathways.',
    inputData: 'Batch records and existing national enrolment database.',
    processing: 'Evaluates Rules A (batch duplicate), B (identity mismatch), C (cross-institution active concurrency), D/E (historical progressions).',
    outputGenerated: 'Explainable risk score (0-100), automated validation findings, prioritized review queue entries.',
    position: [-1.0, -0.45, 0],
    color: '#10B981', // Emerald Neon Green
    geometryType: 'cylinder',
  },
  {
    id: 4,
    name: '4. Central Student Record Repository',
    shortName: 'Master Repository',
    purpose: 'Unified digital storage of verified student records with strict institution-level isolation.',
    inputData: 'Validated student identity objects, admission details, supernumerary quotas.',
    processing: 'Entity relational linkage, data minimization, indexed HMAC queries.',
    outputGenerated: 'Tamper-evident student academic record accessible only by authorized stakeholders.',
    position: [1.0, 0.45, 0],
    color: '#F59E0B', // Solar Amber Gold
    geometryType: 'dodecahedron',
  },
  {
    id: 5,
    name: '5. Analytics & Admission Monitoring',
    shortName: 'Intake Governance',
    purpose: 'Real-time governance dashboard comparing actual student enrolments against AICTE approved seat orders.',
    inputData: 'Enrolment counts, supernumerary quotas (TFW, EWS, PMSSS), NRI quotas.',
    processing: 'Utilization percentage computation, excess enrolment threshold triggers (80% amber / 100% red).',
    outputGenerated: 'National KPI monitoring, regional heatmaps, supervisory excess admission warnings.',
    position: [3.0, -0.45, 0],
    color: '#F43F5E', // Crimson Coral Rose
    geometryType: 'torus',
  },
  {
    id: 6,
    name: '6. Authorized Academic Verification',
    shortName: 'Secure Verification',
    purpose: 'Controlled verification portal for employers and institutions using high-entropy tokens & QR codes.',
    inputData: 'Verification reference token or scanned QR code.',
    processing: 'Cryptographic token match, expiration check, claim minimization (no raw personal data leaked).',
    outputGenerated: 'Signed verification summary displaying credential validity, issuing institution authenticity.',
    position: [5.0, 0, 0],
    color: '#38BDF8', // Celestial Sky Blue
    geometryType: 'icosahedron',
  },
];

// Single 3D Stage Object with Cinematic Opening Transition
function StageMesh({
  stage,
  isSelected,
  onSelect,
}: {
  stage: WorkflowStage;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const outerCageRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth rotational physics
  useFrame((_, delta) => {
    const rotSpeed = isSelected ? 0.9 : isHovered ? 0.6 : 0.35;

    if (coreRef.current) {
      coreRef.current.rotation.x += delta * rotSpeed;
      coreRef.current.rotation.y += delta * (rotSpeed * 0.8);
    }
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x -= delta * (rotSpeed * 0.5);
      outerCageRef.current.rotation.y -= delta * (rotSpeed * 0.7);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 1.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 1.5;
    }
  });

  const renderGeometry = (scale = 1) => {
    switch (stage.geometryType) {
      case 'box':
        return <boxGeometry args={[0.85 * scale, 0.85 * scale, 0.85 * scale]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.48 * scale, 0.48 * scale, 0.95 * scale, 16]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.72 * scale]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[0.65 * scale]} />;
      case 'torus':
        return <torusGeometry args={[0.55 * scale, 0.18 * scale, 16, 32]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[0.72 * scale]} />;
      default:
        return <sphereGeometry args={[0.65 * scale, 16, 16]} />;
    }
  };

  return (
    <group position={stage.position}>
      {/* 1. Large Invisible Hitbox (radius 1.35) for 100% reliable raycast clicking */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[1.35, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 2. Solid Inner Core with Metallic & Emissive Glow */}
      <mesh
        ref={coreRef}
        scale={isSelected ? [1.4, 1.4, 1.4] : isHovered ? [1.15, 1.15, 1.15] : [1, 1, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {renderGeometry(1)}
        <meshStandardMaterial
          color={stage.color}
          emissive={stage.color}
          emissiveIntensity={isSelected ? 0.75 : isHovered ? 0.4 : 0.15}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Outer Wireframe Hologram Cage (Expands in 3D when selected) */}
      <mesh
        ref={outerCageRef}
        scale={isSelected ? [1.9, 1.9, 1.9] : isHovered ? [1.4, 1.4, 1.4] : [1.2, 1.2, 1.2]}
      >
        {renderGeometry(1)}
        <meshBasicMaterial
          color={isSelected ? '#FFFFFF' : stage.color}
          wireframe
          transparent
          opacity={isSelected ? 0.8 : isHovered ? 0.45 : 0.25}
        />
      </mesh>

      {/* 4. Concentric Holographic Gyroscope Rings (Open on Selection Transition) */}
      {isSelected && (
        <>
          {/* Horizontal Ring */}
          <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.45, 1.52, 48]} />
            <meshBasicMaterial color={stage.color} side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>

          {/* Tilted 45deg Ring */}
          <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
            <ringGeometry args={[1.65, 1.72, 48]} />
            <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>

          {/* Point Light Illuminating Active Stage in 3D space */}
          <pointLight color={stage.color} intensity={2.5} distance={5} />
        </>
      )}

      {/* 5. Glowing Pedestal Platform Disc beneath the stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <ringGeometry args={[0.7, 0.78, 32]} />
        <meshBasicMaterial
          color={isSelected ? stage.color : '#333333'}
          side={THREE.DoubleSide}
          transparent
          opacity={isSelected ? 0.7 : 0.2}
        />
      </mesh>

      {/* 6. Subtle 3D Stage Label Banner */}
      <Html center position={[0, isSelected ? 1.55 : 1.25, 0]} distanceFactor={9}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`cursor-pointer whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition-all duration-300 backdrop-blur-md select-none ${
            isSelected
              ? 'bg-white text-black border-white shadow-lg shadow-white/30 scale-110'
              : 'bg-black/70 text-neutral-300 border-[#333333] hover:border-white hover:text-white'
          }`}
        >
          <span>{stage.id}. {stage.shortName}</span>
        </div>
      </Html>
    </group>
  );
}

// Animated Multi-Segment Connecting Tubes with Flowing Data Particles
function WorkflowPipeline() {
  const particleRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 30;

  // Compute curve passing through all 6 stage positions
  const curve = useMemo(() => {
    const points = WORKFLOW_STAGES.map((s) => new THREE.Vector3(...s.position));
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
  }, []);

  // Static pipeline tube geometry
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.035, 8, false);
  }, [curve]);

  // Animate flowing data pulses along the pipeline
  useFrame(({ clock }) => {
    if (!particleRef.current) return;
    const t = clock.getElapsedTime() * 0.12;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < particleCount; i++) {
      const u = (t + i / particleCount) % 1;
      const pos = curve.getPointAt(u);
      dummy.position.copy(pos);
      dummy.scale.setScalar(0.08);
      dummy.updateMatrix();
      particleRef.current.setMatrixAt(i, dummy.matrix);
    }
    particleRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Semi-transparent pipeline backbone */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color="#555555" transparent opacity={0.35} />
      </mesh>

      {/* Instanced Glowing Particles traveling along the pipeline */}
      <instancedMesh ref={particleRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#00F0FF" />
      </instancedMesh>
    </group>
  );
}

// Background Starfield of Small Ambient Particles
function BackgroundStars() {
  const points = useMemo(() => {
    const pts = new Float32Array(150 * 3);
    for (let i = 0; i < 150 * 3; i += 3) {
      pts[i] = (Math.random() - 0.5) * 22;
      pts[i + 1] = (Math.random() - 0.5) * 12;
      pts[i + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return pts;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={150} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#888888" transparent opacity={0.4} />
    </points>
  );
}

// Dynamic Cinematic 3D Camera Rig with Smooth Lerp Gliding
function CameraRig({
  selectedStage,
  zoomMode,
}: {
  selectedStage: WorkflowStage | null;
  zoomMode: 'focus' | 'overview';
}) {
  useFrame(({ camera }, delta) => {
    let targetX = 0;
    let targetY = 0;
    let targetZ = 8.5;

    if (zoomMode === 'focus' && selectedStage) {
      targetX = selectedStage.position[0];
      targetY = selectedStage.position[1] * 0.4;
      targetZ = 4.4; // Close cinematic focus zoom
    }

    // Smooth camera position gliding with delta lerp
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 3.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 3.5);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3.5);

    // Smooth lookAt target tracking
    const lookTargetX = zoomMode === 'focus' && selectedStage ? selectedStage.position[0] * 0.75 : 0;
    const lookTargetY = zoomMode === 'focus' && selectedStage ? selectedStage.position[1] * 0.3 : 0;

    const currentLookX = (camera.userData.lookX = THREE.MathUtils.lerp(camera.userData.lookX || 0, lookTargetX, delta * 3.5));
    const currentLookY = (camera.userData.lookY = THREE.MathUtils.lerp(camera.userData.lookY || 0, lookTargetY, delta * 3.5));
    camera.lookAt(currentLookX, currentLookY, 0);
  });

  return null;
}

export const Workflow3D: React.FC<{
  selectedStageId: number;
  onSelectStage: (stage: WorkflowStage) => void;
  zoomMode?: 'focus' | 'overview';
  onToggleZoomMode?: () => void;
}> = ({ selectedStageId, onSelectStage, zoomMode = 'focus', onToggleZoomMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const selectedStage = useMemo(() => {
    return WORKFLOW_STAGES.find((s) => s.id === selectedStageId) || WORKFLOW_STAGES[0];
  }, [selectedStageId]);

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
    <div ref={containerRef} className="w-full h-[380px] sm:h-[440px] relative select-none">
      {/* 3D Viewport Controls in top right */}
      {onToggleZoomMode && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={onToggleZoomMode}
            className="px-3 py-1.5 rounded-xl bg-[#121212]/90 hover:bg-[#1E1E1E] text-neutral-200 border border-[#2E2E2E] text-xs font-semibold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5"
            title="Toggle between 3D Focused Zoom and Full Overview"
          >
            <span>{zoomMode === 'focus' ? '🌐 View Full Pipeline' : '🔍 Focus Active Stage'}</span>
          </button>
        </div>
      )}

      {isVisible ? (
        <Canvas
          camera={{ position: [0, 0, 7.8], fov: 48 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Studio Volumetric Lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 8, 6]} intensity={1.4} color="#FFFFFF" />
          <directionalLight position={[-6, -4, -4]} intensity={0.8} color="#00F0FF" />
          <directionalLight position={[6, -4, -4]} intensity={0.8} color="#8B5CF6" />

          {/* Camera Smooth Rig */}
          <CameraRig selectedStage={selectedStage} zoomMode={zoomMode} />

          {/* Ambient Cosmic Background */}
          <BackgroundStars />

          {/* Connecting Data Pipeline */}
          <WorkflowPipeline />

          {/* 6 High-Fidelity 3D Stages */}
          {WORKFLOW_STAGES.map((stage) => (
            <StageMesh
              key={stage.id}
              stage={stage}
              isSelected={selectedStageId === stage.id}
              onSelect={() => onSelectStage(stage)}
            />
          ))}
        </Canvas>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
          Scroll to view interactive 3D pipeline
        </div>
      )}
    </div>
  );
};
