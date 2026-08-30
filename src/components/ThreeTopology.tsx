import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AssetNode } from '../types/soc';
import { Shield, Activity, AlertTriangle } from 'lucide-react';

interface ThreeTopologyProps {
  assets: AssetNode[];
  onSelectAsset?: (asset: AssetNode) => void;
}

export const ThreeTopology: React.FC<ThreeTopologyProps> = ({ assets, onSelectAsset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetNode | null>(assets[2] || null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4.2, 11);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const topGroup = new THREE.Group();
    topGroup.position.set(0, 0.4, 0);
    scene.add(topGroup);

    // 1. Grid plane (Gold & Dark Charcoal)
    const gridHelper = new THREE.GridHelper(14, 20, 0xd4af37, 0x222233);
    gridHelper.position.y = -1.8;
    topGroup.add(gridHelper);

    // 2. Asset Meshes
    const nodeMeshes: { mesh: THREE.Mesh; halo: THREE.Mesh; asset: AssetNode }[] = [];

    assets.forEach((asset) => {
      const isAttacked = asset.status === 'UNDER_ATTACK';
      const colorHex = isAttacked ? 0xff3366 : (asset.role === 'FIREWALL' ? 0xd4af37 : 0xe2e8f0);

      // Main Node Octahedron
      const geo = new THREE.OctahedronGeometry(0.6);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.85
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...asset.position3D);
      topGroup.add(mesh);

      // Outer Pulsing Ring
      const haloGeo = new THREE.RingGeometry(0.78, 0.9, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isAttacked ? 0.9 : 0.35
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(...asset.position3D);
      halo.rotation.x = Math.PI / 2;
      topGroup.add(halo);

      nodeMeshes.push({ mesh, halo, asset });
    });

    // 3. Topology Connections (Gold Lines)
    const connections: [number, number][] = [
      [0, 1], // Firewall -> DMZ Proxy
      [1, 2], // DMZ -> Juice Shop App
      [1, 3], // DMZ -> Auth Server
      [2, 4], // Juice Shop -> DB
      [3, 4], // Auth -> DB
      [0, 5], // Firewall -> SIEM Core
      [2, 5], // Juice Shop -> SIEM Core
      [3, 5]  // Auth -> SIEM Core
    ];

    connections.forEach(([fromIdx, toIdx]) => {
      const p1 = new THREE.Vector3(...assets[fromIdx].position3D);
      const p2 = new THREE.Vector3(...assets[toIdx].position3D);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.5,
        linewidth: 1.5
      });
      const line = new THREE.Line(lineGeo, lineMat);
      topGroup.add(line);
    });

    // 4. Lighting (Warm Gold Light)
    const ambLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambLight);

    const pointLight = new THREE.PointLight(0xd4af37, 2.5, 50);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // 5. Animation Loop
    let angle = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      angle += 0.03;

      nodeMeshes.forEach(({ mesh, halo, asset }) => {
        mesh.rotation.y += 0.02;
        mesh.rotation.x += 0.01;

        if (asset.status === 'UNDER_ATTACK') {
          const scale = 1 + Math.sin(angle * 2.5) * 0.25;
          halo.scale.set(scale, scale, scale);
        }
      });

      topGroup.rotation.y = Math.sin(angle * 0.2) * 0.12;

      renderer.render(scene, camera);
    };
    animate();

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
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [assets]);

  return (
    <div className="relative w-full h-[450px] soc-card overflow-hidden flex items-center justify-center p-2">
      <div className="w-full h-full rounded-xl overflow-hidden" ref={containerRef} />

      {/* Header Overlay */}
      <div className="absolute top-4 left-5 pointer-events-none flex flex-col gap-1 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-display tracking-widest text-emerald-400 font-bold uppercase">
            3D Defense Grid & Topology
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          Segment: VLAN-10.0.0.0/24 (DMZ & Internal Cluster)
        </span>
      </div>

      {/* Asset Selector / Status card overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 overflow-x-auto p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800 backdrop-blur-md z-10">
        {assets.map((asset) => {
          const isSelected = selectedAsset?.id === asset.id;
          const isUnderAttack = asset.status === 'UNDER_ATTACK';

          return (
            <button
              key={asset.id}
              onClick={() => {
                setSelectedAsset(asset);
                if (onSelectAsset) onSelectAsset(asset);
              }}
              className={`flex-1 min-w-[130px] text-left p-2.5 rounded-lg transition-all border ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_18px_rgba(212,175,55,0.3)]'
                  : isUnderAttack
                  ? 'bg-rose-950/40 border-rose-500/50 hover:border-rose-400'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="font-semibold text-neutral-200 truncate">{asset.name}</span>
                {isUnderAttack ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="text-[10px] font-mono text-neutral-400 flex justify-between">
                <span>{asset.ip}</span>
                <span className={isUnderAttack ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {asset.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
