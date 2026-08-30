import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AttackVectorArc } from '../types/soc';

interface ThreeGlobeProps {
  attackArcs: AttackVectorArc[];
  onSelectOrigin?: (city: string) => void;
}

// Convert lat/lng to 3D sphere coordinate
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const ThreeGlobe: React.FC<ThreeGlobeProps> = ({ attackArcs }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 350;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    // 2. Base Sphere & Wireframe
    const RADIUS = 8;
    const sphereGeo = new THREE.SphereGeometry(RADIUS, 36, 36);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x051329,
      emissive: 0x020814,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // Inner glowing core
    const innerGeo = new THREE.SphereGeometry(RADIUS * 0.96, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x071b38,
      transparent: true,
      opacity: 0.85
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerCore);

    // 3. Dot particle grid representing global continents / cyber nodes
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = RADIUS * 1.01;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Cyan / electric blue nodes
      colors[i * 3] = 0.0;
      colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 2] = 1.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });
    const pointGrid = new THREE.Points(particleGeo, pMat);
    globeGroup.add(pointGrid);

    // 4. Outer Orbital Rings
    const ringGeo = new THREE.RingGeometry(RADIUS * 1.25, RADIUS * 1.28, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    globeGroup.add(ring);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    dirLight.position.set(20, 20, 20);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xff0055, 1.2);
    backLight.position.set(-20, -10, -20);
    scene.add(backLight);

    // 6. Interactive Drag Controls
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Render Loop
    let animAngle = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (globeGroupRef.current && !isDragging) {
        globeGroupRef.current.rotation.y += 0.0025;
      }

      animAngle += 0.02;
      ring.rotation.z = animAngle * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Attack Vector Arcs when telemetry updates
  useEffect(() => {
    if (!arcsGroupRef.current) return;
    const arcsGroup = arcsGroupRef.current;
    
    // Clear old arcs
    while (arcsGroup.children.length > 0) {
      const obj = arcsGroup.children[0] as THREE.Mesh;
      if (obj.geometry) obj.geometry.dispose();
      arcsGroup.remove(obj);
    }

    const RADIUS = 8;
    const destVec = latLngToVector3(37.7749, -122.4194, RADIUS); // SOC HQ

    // Destination Pin (SOC HQ)
    const hqGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const hqMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const hqMesh = new THREE.Mesh(hqGeo, hqMat);
    hqMesh.position.copy(destVec);
    arcsGroup.add(hqMesh);

    attackArcs.forEach((arc) => {
      const srcVec = latLngToVector3(arc.sourceLat, arc.sourceLng, RADIUS);

      // Source Threat Pin
      const srcGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const colorHex = arc.severity === 'critical' ? 0xff0055 : (arc.severity === 'high' ? 0xffaa00 : 0x00f0ff);
      const srcMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const srcMesh = new THREE.Mesh(srcGeo, srcMat);
      srcMesh.position.copy(srcVec);
      arcsGroup.add(srcMesh);

      // Arc curve in 3D
      const midVec = new THREE.Vector3().addVectors(srcVec, destVec).multiplyScalar(0.5);
      const distance = srcVec.distanceTo(destVec);
      midVec.normalize().multiplyScalar(RADIUS + distance * 0.32);

      const curve = new THREE.QuadraticBezierCurve3(srcVec, midVec, destVec);
      const points = curve.getPoints(30);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      
      const curveMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.65,
        linewidth: 2
      });

      const line = new THREE.Line(curveGeo, curveMat);
      arcsGroup.add(line);
    });

  }, [attackArcs]);

  return (
    <div className="relative w-full h-[360px] glass-panel overflow-hidden flex flex-col">
      {/* 3D Canvas Viewport */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing" ref={containerRef} />

      {/* Futuristic HUD Overlay */}
      <div className="absolute top-3 left-4 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-cyber-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="text-xs font-display tracking-widest text-cyan-400 font-semibold uppercase">
            Global Threat Vector Map
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Target: SOC-CORE [37.77° N, 122.41° W]
        </span>
      </div>

      <div className="absolute bottom-3 right-4 pointer-events-none flex items-center gap-3 text-[11px] font-mono bg-slate-900/80 px-3 py-1.5 rounded border border-cyan-500/20 backdrop-blur-md">
        <span className="text-rose-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span> Critical
        </span>
        <span className="text-amber-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span> High
        </span>
        <span className="text-cyan-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span> Probes
        </span>
        <span className="text-slate-500 text-[10px]">Drag to rotate</span>
      </div>
    </div>
  );
};
