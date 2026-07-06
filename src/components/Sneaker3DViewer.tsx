import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Camera, Sparkles } from 'lucide-react';

interface Sneaker3DViewerProps {
  colors: {
    upper: string;
    midsole: string;
    laces: string;
    accent: string;
  };
  engraving?: string;
  className?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  showAmbientGlow?: boolean;
}

export default function Sneaker3DViewer({
  colors,
  engraving = '',
  className = '',
  autoRotate = true,
  interactive = true,
  showAmbientGlow = true,
}: Sneaker3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  // Keep references to mesh groups so we can dynamically update colors without re-rendering the whole canvas
  const materialsRef = useRef<{
    upper: THREE.MeshStandardMaterial;
    midsole: THREE.MeshStandardMaterial;
    laces: THREE.MeshStandardMaterial;
    accent: THREE.MeshStandardMaterial;
    heelPlate: THREE.MeshStandardMaterial;
    pods: THREE.MeshStandardMaterial;
  } | null>(null);

  const shoeGroupRef = useRef<THREE.Group | null>(null);
  const engravingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const engravingTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rotationStartRef = useRef({ x: 0, y: 0 });
  const hoverMouseRef = useRef({ x: 0, y: 0 });
  const scrollYRef = useRef(0);
  const [telemetry, setTelemetry] = useState({ rotX: 0, rotY: 0, pitch: 98 });

  // 1. Initialize Dynamic Engraving Texture Helper
  const updateEngravingTexture = (text: string) => {
    const canvas = engravingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw dark carbon fiber weave background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 256, 128);

    // Dynamic accent bounding box
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 236, 108);

    // Tech line markings
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 256; i += 8) {
      ctx.fillRect(i, 0, 2, 128);
    }

    // Print Engraved text
    ctx.font = 'black 32px "JetBrains Mono", monospace';
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.substring(0, 6).toUpperCase() || 'ZEROX', 128, 64);

    // Trigger texture update
    if (engravingTextureRef.current) {
      engravingTextureRef.current.needsUpdate = true;
    }
  };

  // 2. Main Three.js Scene Setup
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 400;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(colors.accent, 0.8);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    const floorSpot = new THREE.PointLight(colors.accent, 1.5, 8);
    floorSpot.position.set(0, -2, 0);
    scene.add(floorSpot);

    // MATERIALS SETUP
    const mats = {
      upper: new THREE.MeshStandardMaterial({
        color: new THREE.Color(colors.upper),
        roughness: 0.6,
        metalness: 0.1,
        bumpScale: 0.05,
      }),
      midsole: new THREE.MeshStandardMaterial({
        color: new THREE.Color(colors.midsole),
        roughness: 0.8,
        metalness: 0.0,
      }),
      laces: new THREE.MeshStandardMaterial({
        color: new THREE.Color(colors.laces),
        roughness: 0.7,
        metalness: 0.0,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: new THREE.Color(colors.accent),
        roughness: 0.1,
        metalness: 0.95, // High metal shine
      }),
      heelPlate: new THREE.MeshStandardMaterial({
        roughness: 0.4,
        metalness: 0.8,
      }),
      pods: new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.3,
        metalness: 0.9,
      }),
    };
    materialsRef.current = mats;

    // Set up Dynamic Engraving Texture Canvas
    const engravingCanvas = document.createElement('canvas');
    engravingCanvas.width = 256;
    engravingCanvas.height = 128;
    engravingCanvasRef.current = engravingCanvas;

    const engravingTexture = new THREE.CanvasTexture(engravingCanvas);
    engravingTextureRef.current = engravingTexture;
    mats.heelPlate.map = engravingTexture;
    updateEngravingTexture(engraving);

    // PROCEDURAL SNEAKER GEOMETRY CONSTRUCT
    const shoeGroup = new THREE.Group();
    shoeGroupRef.current = shoeGroup;

    // 1. MIDSOLE
    const midsoleGeo = new THREE.BoxGeometry(3.0, 0.35, 1.0);
    // Smooth/warp midsole vertices slightly to give custom organic flare
    const pos = midsoleGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);
      
      // Make back thicker, front thinner/sleeker (heel lift)
      if (x < 0) {
        y += (x * -0.15); // thicker back
      } else {
        y -= (x * 0.05); // thinner toe drop
      }
      pos.setXYZ(i, x, y, z);
    }
    midsoleGeo.computeVertexNormals();
    const midsoleMesh = new THREE.Mesh(midsoleGeo, mats.midsole);
    midsoleMesh.position.set(0, -0.4, 0);
    midsoleMesh.receiveShadow = true;
    midsoleMesh.castShadow = true;
    shoeGroup.add(midsoleMesh);

    // Nitrogen Cushioning Pods (high-tech cylinder capsules built into the side)
    const podGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16);
    podGeo.rotateZ(Math.PI / 2);
    const podPositions = [
      [-0.8, -0.4, 0.52], [0.1, -0.45, 0.52],
      [-0.8, -0.4, -0.52], [0.1, -0.45, -0.52],
    ];
    podPositions.forEach(([px, py, pz]) => {
      const podMesh = new THREE.Mesh(podGeo, mats.pods);
      podMesh.position.set(px, py, pz);
      shoeGroup.add(podMesh);
    });

    // 2. SOLE OUTSOLE BASE
    const outsoleGeo = new THREE.BoxGeometry(3.05, 0.08, 1.02);
    const outsoleMesh = new THREE.Mesh(outsoleGeo, mats.pods);
    outsoleMesh.position.set(0, -0.6, 0);
    shoeGroup.add(outsoleMesh);

    // 3. MAIN UPPER BODY
    const upperGeo = new THREE.BoxGeometry(2.6, 0.8, 0.95);
    // Sculpt the upper
    const upPos = upperGeo.attributes.position;
    for (let i = 0; i < upPos.count; i++) {
      let x = upPos.getX(i);
      let y = upPos.getY(i);
      let z = upPos.getZ(i);

      // Slant front toe box down
      if (x > 0.4) {
        y -= (x * 0.45);
      }
      // Ankle area rises higher
      if (x < -0.2 && y > 0) {
        y += 0.25;
      }
      upPos.setXYZ(i, x, y, z);
    }
    upperGeo.computeVertexNormals();
    const upperMesh = new THREE.Mesh(upperGeo, mats.upper);
    upperMesh.position.set(-0.15, 0.1, 0);
    upperMesh.castShadow = true;
    upperMesh.receiveShadow = true;
    shoeGroup.add(upperMesh);

    // 4. SLEEK TOE CAP GUARD
    const toeGeo = new THREE.SphereGeometry(0.5, 32, 16);
    toeGeo.scale(1.1, 0.55, 0.95);
    const toeMesh = new THREE.Mesh(toeGeo, mats.accent);
    toeMesh.position.set(1.18, -0.2, 0);
    toeMesh.castShadow = true;
    shoeGroup.add(toeMesh);

    // 5. ANKLE COLLAR / ENTRY LINER
    const collarGeo = new THREE.TorusGeometry(0.35, 0.08, 16, 64);
    collarGeo.rotateX(Math.PI / 2);
    collarGeo.scale(1.2, 1.0, 1.0);
    const collarMesh = new THREE.Mesh(collarGeo, mats.accent);
    collarMesh.position.set(-0.6, 0.62, 0);
    shoeGroup.add(collarMesh);

    // 6. LACES STRETCH LOGIC
    const lacesGroup = new THREE.Group();
    const laceStrandGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
    laceStrandGeo.rotateZ(Math.PI / 2);

    const lacePositions = [
      [0.0, 0.45, 0],
      [0.3, 0.35, 0],
      [0.6, 0.2, 0],
    ];
    lacePositions.forEach(([lx, ly, lz], idx) => {
      // Crossed laces mesh
      const strand1 = new THREE.Mesh(laceStrandGeo, mats.laces);
      strand1.position.set(lx, ly, lz);
      strand1.rotation.y = 0.3;
      strand1.scale.set(0.9, 1, 1);
      lacesGroup.add(strand1);

      const strand2 = new THREE.Mesh(laceStrandGeo, mats.laces);
      strand2.position.set(lx, ly, lz);
      strand2.rotation.y = -0.3;
      strand2.scale.set(0.9, 1, 1);
      lacesGroup.add(strand2);
    });
    shoeGroup.add(lacesGroup);

    // 7. HEEL METAL BRACE (METALLIC ACCENT)
    const heelBraceGeo = new THREE.TorusGeometry(0.48, 0.08, 16, 32, Math.PI);
    heelBraceGeo.rotateY(-Math.PI / 2);
    const heelBraceMesh = new THREE.Mesh(heelBraceGeo, mats.accent);
    heelBraceMesh.position.set(-1.25, 0.1, 0);
    shoeGroup.add(heelBraceMesh);

    // 8. LASER ENGRAVED HEEL PLATE
    const plateGeo = new THREE.BoxGeometry(0.1, 0.35, 0.7);
    const plateMesh = new THREE.Mesh(plateGeo, mats.heelPlate);
    plateMesh.position.set(-1.36, 0.05, 0);
    shoeGroup.add(plateMesh);

    // SCALE AND RE-POSITION SHOE TO FIT VIEWPORT
    shoeGroup.scale.set(1.15, 1.15, 1.15);
    shoeGroup.rotation.y = -Math.PI / 5; // Initial classy showcase angle
    scene.add(shoeGroup);

    // GROUND PLATFORM WITH MATTE REFLECTION
    const floorGeo = new THREE.PlaneGeometry(15, 15);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Spinning Concentric Tech Rings for "Motion Graphic Level 3" biomechanical vibe
    const ringGeo1 = new THREE.RingGeometry(1.4, 1.43, 32);
    ringGeo1.rotateX(Math.PI / 2);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: colors.accent, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.position.y = -1.18;
    scene.add(ringMesh1);

    const ringGeo2 = new THREE.RingGeometry(1.0, 1.015, 32);
    ringGeo2.rotateX(Math.PI / 2);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.position.y = -1.18;
    scene.add(ringMesh2);

    // Glowing Holographic 3D Floating Particle System
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Cylindrical distribution around sneaker
      const radius = 0.8 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      positions[i] = radius * Math.cos(theta);
      positions[i + 1] = -0.9 + Math.random() * 2.5; // height
      positions[i + 2] = radius * Math.sin(theta);

      velocities.push((Math.random() - 0.5) * 0.004); // vx
      velocities.push(0.008 + Math.random() * 0.012);  // vy (float up)
      velocities.push((Math.random() - 0.5) * 0.004); // vz
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(colors.accent),
      size: 0.038,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Simple grid helper below shoe for extreme futuristic tech vibe
    if (showAmbientGlow) {
      const gridHelper = new THREE.GridHelper(10, 20, 0xC9A227, 0x111111);
      gridHelper.position.y = -1.19;
      scene.add(gridHelper);
    }

    // ANIMATION LOOP WITH TELEMETRY CAPTURE
    const startTime = performance.now();
    let frameCount = 0;

    const animate = (time: number) => {
      const elapsed = (time - startTime) * 0.001;
      frameCount++;

      // Spin tech rings
      if (ringMesh1) ringMesh1.rotation.y = elapsed * 0.3;
      if (ringMesh2) ringMesh2.rotation.y = -elapsed * 0.45;

      // Float holographic particles
      if (particleSystem) {
        const posArr = particleSystem.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          posArr[idx + 1] += velocities[i * 3 + 1];
          posArr[idx] += velocities[i * 3];
          posArr[idx + 2] += velocities[i * 3 + 2];

          // Wrap around if particles drift too high
          if (posArr[idx + 1] > 2.0) {
            posArr[idx + 1] = -1.0;
            posArr[idx] = (Math.random() - 0.5) * 3.0;
            posArr[idx + 2] = (Math.random() - 0.5) * 3.0;
          }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.rotation.y = elapsed * 0.08;
      }

      // Dynamic floating effect (gentle sinus bounce)
      if (shoeGroupRef.current) {
        // Continuous float
        const targetY = Math.sin(elapsed * 1.5) * 0.12;
        shoeGroupRef.current.position.y = THREE.MathUtils.lerp(shoeGroupRef.current.position.y, targetY, 0.05);
        
        // Hover tilt reaction when NOT dragging
        if (!isDragging) {
          let targetRotY = -Math.PI / 5 + hoverMouseRef.current.x * 0.55;
          if (autoRotate) {
            targetRotY += elapsed * 0.12; // slow cinematic rotation combined with mouse tilt
          }
          let targetRotX = hoverMouseRef.current.y * 0.35;
          
          // Subtle tilt based on global scroll position
          targetRotX += Math.sin(scrollYRef.current * 0.002) * 0.15;

          shoeGroupRef.current.rotation.y = THREE.MathUtils.lerp(shoeGroupRef.current.rotation.y, targetRotY, 0.05);
          shoeGroupRef.current.rotation.x = THREE.MathUtils.lerp(shoeGroupRef.current.rotation.x, targetRotX, 0.05);
        }

        // Live Telemetry stream update every 12 frames (extremely efficient!)
        if (frameCount % 12 === 0) {
          setTelemetry({
            rotX: shoeGroupRef.current.rotation.x,
            rotY: shoeGroupRef.current.rotation.y,
            pitch: Math.round(95 + Math.sin(elapsed * 2) * 4)
          });
        }
      }

      // Dynamic cinematic camera scroll zoom
      const targetZoom = Math.max(2.8, 5.5 - (scrollYRef.current * 0.0022));
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZoom, 0.05);

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // RESIZE EVENT
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // SCROLL EVENT FOR DYNAMIC ZOOM
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      renderer.dispose();
      midsoleGeo.dispose();
      upperGeo.dispose();
      toeGeo.dispose();
      collarGeo.dispose();
      laceStrandGeo.dispose();
      heelBraceGeo.dispose();
      plateGeo.dispose();
      floorGeo.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      mats.upper.dispose();
      mats.midsole.dispose();
      mats.laces.dispose();
      mats.accent.dispose();
      mats.heelPlate.dispose();
      mats.pods.dispose();
      engravingTexture.dispose();
    };
  }, []);

  // 3. Keep 3D Scene Material Colors in Sync Reactively with Props!
  useEffect(() => {
    if (materialsRef.current) {
      materialsRef.current.upper.color.set(colors.upper);
      materialsRef.current.midsole.color.set(colors.midsole);
      materialsRef.current.laces.color.set(colors.laces);
      materialsRef.current.accent.color.set(colors.accent);
      
      // Update dynamic spots & rim highlights
      updateEngravingTexture(engraving);
    }
  }, [colors, engraving]);

  // Mouse / Touch Drag rotation controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (shoeGroupRef.current) {
      rotationStartRef.current = {
        x: shoeGroupRef.current.rotation.x,
        y: shoeGroupRef.current.rotation.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      if (!interactive || !shoeGroupRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      shoeGroupRef.current.rotation.y = rotationStartRef.current.y + deltaX * 0.007;
      shoeGroupRef.current.rotation.x = THREE.MathUtils.clamp(
        rotationStartRef.current.x + deltaY * 0.007,
        -Math.PI / 4,
        Math.PI / 4
      );
    } else {
      // Hover tilt calculation relative to container bounds
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        hoverMouseRef.current = { x, y };
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    hoverMouseRef.current = { x: 0, y: 0 };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive || e.touches.length === 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (shoeGroupRef.current) {
      rotationStartRef.current = {
        x: shoeGroupRef.current.rotation.x,
        y: shoeGroupRef.current.rotation.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !interactive || !shoeGroupRef.current || e.touches.length === 0) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;

    shoeGroupRef.current.rotation.y = rotationStartRef.current.y + deltaX * 0.01;
    shoeGroupRef.current.rotation.x = THREE.MathUtils.clamp(
      rotationStartRef.current.x + deltaY * 0.01,
      -Math.PI / 4,
      Math.PI / 4
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* HUD calibration crosshair / grid overlay */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-white/[0.03] pointer-events-none" />
      <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-[1px] bg-white/[0.03] pointer-events-none" />

      {/* Corner HUD Brackets */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#C9A227]/40 pointer-events-none" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#C9A227]/40 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#C9A227]/40 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#C9A227]/40 pointer-events-none" />

      {/* Left HUD Stats Sidebar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 font-mono text-[8px] text-neutral-400 tracking-wider pointer-events-none select-none hidden sm:flex">
        <div className="flex flex-col border-l border-[#C9A227]/30 pl-2 bg-black/30 backdrop-blur-[2px] py-1 pr-1.5 rounded-r">
          <span className="text-[7px] text-neutral-500 uppercase">SYS_STABILITY</span>
          <span className="text-[#C9A227] font-bold">99.85% [OK]</span>
        </div>
        <div className="flex flex-col border-l border-[#C9A227]/30 pl-2 bg-black/30 backdrop-blur-[2px] py-1 pr-1.5 rounded-r">
          <span className="text-[7px] text-neutral-500 uppercase">CARBON_PLATE</span>
          <span className="text-white font-semibold">TENSION: 4.8 KN</span>
        </div>
        <div className="flex flex-col border-l border-[#C9A227]/30 pl-2 bg-black/30 backdrop-blur-[2px] py-1 pr-1.5 rounded-r">
          <span className="text-[7px] text-neutral-500 uppercase">NITRO_CELLS</span>
          <span className="text-white font-semibold">FLOW: ACTIVE</span>
        </div>
        <div className="flex flex-col border-l border-[#C9A227]/30 pl-2 bg-black/30 backdrop-blur-[2px] py-1 pr-1.5 rounded-r">
          <span className="text-[7px] text-neutral-500 uppercase">PITCH_INDEX</span>
          <span className="text-amber-500 font-bold">{telemetry.pitch}%</span>
        </div>
      </div>

      {/* Right HUD Stats Sidebar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 font-mono text-[8px] text-neutral-400 tracking-wider pointer-events-none select-none hidden sm:flex text-right">
        <div className="flex flex-col border-r border-[#C9A227]/30 pr-2 bg-black/30 backdrop-blur-[2px] py-1 pl-1.5 rounded-l items-end">
          <span className="text-[7px] text-neutral-500 uppercase">YAW_ROTATION</span>
          <span className="text-[#C9A227] font-bold">{(telemetry.rotY * (180/Math.PI)).toFixed(1)}°</span>
        </div>
        <div className="flex flex-col border-r border-[#C9A227]/30 pr-2 bg-black/30 backdrop-blur-[2px] py-1 pl-1.5 rounded-l items-end">
          <span className="text-[7px] text-neutral-500 uppercase">PITCH_TILT</span>
          <span className="text-white font-semibold">{(telemetry.rotX * (180/Math.PI)).toFixed(1)}°</span>
        </div>
        <div className="flex flex-col border-r border-[#C9A227]/30 pr-2 bg-black/30 backdrop-blur-[2px] py-1 pl-1.5 rounded-l items-end">
          <span className="text-[7px] text-neutral-500 uppercase">RENDER_ENGINE</span>
          <span className="text-white font-semibold">THREE_JS // V3</span>
        </div>
        <div className="flex flex-col border-r border-[#C9A227]/30 pr-2 bg-black/30 backdrop-blur-[2px] py-1 pl-1.5 rounded-l items-end">
          <span className="text-[7px] text-neutral-500 uppercase">CREATOR_ID</span>
          <span className="text-amber-500 font-bold">BASIT_404</span>
        </div>
      </div>

      {interactive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 text-center pointer-events-none select-none z-10">
          <span className="font-mono text-[7.5px] uppercase tracking-[0.25em] text-[#C9A227] font-bold">
            DRAG TO ROTATE SNEAKER Core
          </span>
        </div>
      )}
    </div>
  );
}
