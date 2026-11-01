import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AgentType } from '../types';

interface CareCircle3DOrbProps {
  activeAgent?: AgentType;
  onSelectAgent?: (agent: AgentType) => void;
  isElderlyMode?: boolean;
}

export const CareCircle3DOrb: React.FC<CareCircle3DOrbProps> = ({
  activeAgent = 'patient_care',
  onSelectAgent,
  isElderlyMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    // If Elderly Mode or reduced motion, use graceful 2D representation
    if (isElderlyMode) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setWebglSupported(false);
      return;
    }

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    // Create Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Central Core Sphere (Elderly Care Guardian Core)
    const coreGeometry = new THREE.SphereGeometry(0.85, 32, 32);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d4d38, // Warm forest green
      roughness: 0.3,
      metalness: 0.2,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Inner glowing ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.25, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x86efac,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    scene.add(ringMesh);

    // 4 Satellite agent orbs (Patient, Caregiver, Clinician, Social)
    const agentConfigs = [
      { color: 0x10b981, dist: 1.5, speed: 0.8, offset: 0, type: 'patient_care' },
      { color: 0x3b82f6, dist: 1.6, speed: 0.7, offset: Math.PI / 2, type: 'caregiver_agent' },
      { color: 0x8b5cf6, dist: 1.55, speed: 0.75, offset: Math.PI, type: 'clinician_agent' },
      { color: 0xf59e0b, dist: 1.65, speed: 0.85, offset: (3 * Math.PI) / 2, type: 'social_wellbeing' },
    ];

    const satellites: { mesh: THREE.Mesh; config: (typeof agentConfigs)[0] }[] = [];

    agentConfigs.forEach((cfg) => {
      const satGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      scene.add(satMesh);
      satellites.push({ mesh: satMesh, config: cfg });
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef3c7, 1.6);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x34d399, 2, 8);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Core rotation & breath pulse
      coreMesh.rotation.y = elapsedTime * 0.25;
      coreMesh.rotation.x = Math.sin(elapsedTime * 0.4) * 0.1;
      const pulseScale = 1 + Math.sin(elapsedTime * 1.5) * 0.03;
      coreMesh.scale.set(pulseScale, pulseScale, pulseScale);

      ringMesh.rotation.z = elapsedTime * 0.15;

      // Update satellites orbit
      satellites.forEach(({ mesh, config }) => {
        const angle = elapsedTime * config.speed * 0.6 + config.offset;
        mesh.position.x = Math.cos(angle) * config.dist;
        mesh.position.z = Math.sin(angle) * (config.dist * 0.7);
        mesh.position.y = Math.sin(angle * 2) * 0.25;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 320;
      const newHeight = container.clientHeight || 260;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [isElderlyMode]);

  // Graceful fallback for Elderly Mode, reduced motion, or WebGL-unsupported environments
  if (isElderlyMode || !webglSupported) {
    return (
      <div className="w-full h-48 flex items-center justify-center p-4">
        <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-emerald-50 border-4 border-emerald-600/30">
          <div className="w-20 h-20 rounded-full bg-emerald-800 text-white flex flex-col items-center justify-center text-center p-2 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider">Elderly</span>
            <span className="text-[9px] text-emerald-200">Active Guardian</span>
          </div>

          {/* 4 Agent Badges */}
          <div className="absolute -top-3 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-full shadow-xs">
            Patient
          </div>
          <div className="absolute -bottom-3 px-2 py-0.5 bg-blue-700 text-white text-[10px] font-bold rounded-full shadow-xs">
            Caregiver
          </div>
          <div className="absolute -left-3 px-2 py-0.5 bg-purple-700 text-white text-[10px] font-bold rounded-full shadow-xs">
            Doctor
          </div>
          <div className="absolute -right-3 px-2 py-0.5 bg-amber-700 text-white text-[10px] font-bold rounded-full shadow-xs">
            Social
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative flex flex-col items-center justify-center">
      <div ref={containerRef} className="w-full h-56 max-w-sm flex items-center justify-center cursor-pointer" />
      <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-stone-600 -mt-2">
        <span className="inline-flex items-center gap-1 text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Patient
        </span>
        <span className="inline-flex items-center gap-1 text-blue-800">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Caregiver
        </span>
        <span className="inline-flex items-center gap-1 text-purple-800">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span> Clinician
        </span>
        <span className="inline-flex items-center gap-1 text-amber-800">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Social
        </span>
      </div>
    </div>
  );
};
