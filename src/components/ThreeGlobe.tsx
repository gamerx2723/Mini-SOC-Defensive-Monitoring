import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AttackVectorArc } from '../types/soc';

interface ThreeGlobeProps {
  attackArcs: AttackVectorArc[];
}

export const ThreeGlobe: React.FC<ThreeGlobeProps> = ({ attackArcs }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);

  // Helper: Convert Lat/Long to 3D Coordinates on Sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup - Backed up camera for ideal unzoomed framing
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 25);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Globe Group - Proportional radius (5.8) for clear unzoomed visibility
    const globeGroup = new THREE.Group();
    globeGroup.position.set(0, 0, 0);
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    const arcsGroup = new THREE.Group();
    arcsGroupRef.current = arcsGroup;
    globeGroup.add(arcsGroup);

    const RADIUS = 5.8;

    // Wireframe Sphere (Metallic Dark Silver / Charcoal)
    const sphereGeo = new THREE.SphereGeometry(RADIUS, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x2e2e42,
      emissive: 0x121220,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // Inner Core (Obsidian glow)
    const innerGeo = new THREE.SphereGeometry(RADIUS * 0.97, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x080812,
      transparent: true,
      opacity: 0.88
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerCore);

    // 3. Dot particle grid representing global continents / nodes (Bright Gold & Silver)
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = RADIUS * 1.015;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Gold & Silver particles
      const isGold = Math.random() > 0.4;
      if (isGold) {
        colors[i * 3] = 0.95;     // R (Gold)
        colors[i * 3 + 1] = 0.80; // G
        colors[i * 3 + 2] = 0.28; // B
      } else {
        colors[i * 3] = 0.94;     // R (Silver)
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.0;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    const pointGrid = new THREE.Points(particleGeo, pMat);
    globeGroup.add(pointGrid);

    // 4. Outer Orbital Gold Rings
    const ringGeo = new THREE.RingGeometry(RADIUS * 1.25, RADIUS * 1.28, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    globeGroup.add(ring);

    // 5. Lighting (Warm Gold Light + Crisp White Fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const goldDirLight = new THREE.DirectionalLight(0xd4af37, 2.0);
    goldDirLight.position.set(20, 20, 20);
    scene.add(goldDirLight);

    const silverBackLight = new THREE.DirectionalLight(0xe2e8f0, 1.4);
    silverBackLight.position.set(-20, -10, -20);
    scene.add(silverBackLight);

    // 6. User Orbit Controls (Drag to Rotate)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (globeGroupRef.current && !isDragging) {
        globeGroupRef.current.rotation.y += 0.0022;
      }

      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !rendererRef.current) return;
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

    const RADIUS = 5.8;
    const destVec = latLngToVector3(37.7749, -122.4194, RADIUS); // SOC HQ

    // Destination Pin (SOC HQ - Gold Beacon)
    const hqGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const hqMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
    const hqMesh = new THREE.Mesh(hqGeo, hqMat);
    hqMesh.position.copy(destVec);
    arcsGroup.add(hqMesh);

    attackArcs.forEach((arc) => {
      const srcVec = latLngToVector3(arc.sourceLat, arc.sourceLng, RADIUS);

      // Source Threat Pin
      const srcGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const colorHex = arc.severity === 'critical' ? 0xff3366 : (arc.severity === 'high' ? 0xf59e0b : 0xd4af37);
      const srcMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const srcMesh = new THREE.Mesh(srcGeo, srcMat);
      srcMesh.position.copy(srcVec);
      arcsGroup.add(srcMesh);

      // Arc curve in 3D
      const midVec = new THREE.Vector3().addVectors(srcVec, destVec).multiplyScalar(0.5);
      const distance = srcVec.distanceTo(destVec);
      midVec.normalize().multiplyScalar(RADIUS + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(srcVec, midVec, destVec);
      const points = curve.getPoints(30);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      
      const curveMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.85,
        linewidth: 2
      });

      const line = new THREE.Line(curveGeo, curveMat);
      arcsGroup.add(line);
    });

  }, [attackArcs]);

  return (
    <div className="relative w-full h-[450px] soc-card overflow-hidden flex items-center justify-center p-2">
      {/* 3D Canvas Viewport - Centered & Unzoomed */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing rounded-xl overflow-hidden flex items-center justify-center" ref={containerRef} />

      {/* Luxury HUD Overlay */}
      <div className="absolute top-4 left-5 pointer-events-none flex flex-col gap-1 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#d4af37]" />
          <span className="text-xs font-display tracking-widest text-amber-400 font-bold uppercase">
            Global Threat Vectors
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          Target: SOC-CORE [37.77° N, 122.41° W]
        </span>
      </div>

      <div className="absolute bottom-4 right-5 pointer-events-none flex items-center gap-3 text-[11px] font-mono bg-neutral-950/80 px-3.5 py-1.5 rounded-lg border border-neutral-800 backdrop-blur-md z-10">
        <span className="text-rose-400 flex items-center gap-1.5 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span> Critical
        </span>
        <span className="text-amber-400 flex items-center gap-1.5 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span> High
        </span>
        <span className="text-neutral-300 flex items-center gap-1.5 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-neutral-300"></span> Probes
        </span>
        <span className="text-neutral-500 text-[10px] ml-1">Drag to rotate</span>
      </div>
    </div>
  );
};
