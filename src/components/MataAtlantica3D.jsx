import React, { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingMataFoliage() {
  const meshRef = useRef();
  const count = 100;

  // Generate 3D positions and rotations for tropical leaves (Costela-de-Adão / Samambaias)
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 22,
        z: (Math.random() - 0.5) * 20,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        speedX: (Math.random() - 0.5) * 0.006,
        speedY: (Math.random() - 0.5) * 0.005,
        scale: 0.18 + Math.random() * 0.28,
        colorType: Math.random() > 0.4 ? '#28593B' : '#D4AF37',
      });
    }
    return temp;
  }, [count]);

  // Tropical Leaf Shape Geometry (Costela-de-Adão / Leaf profile)
  const leafShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.5, 0.5, 1.0, 0, 1.6);
    shape.bezierCurveTo(-0.5, 1.0, -0.3, 0.5, 0, 0);
    return shape;
  }, []);

  const geometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
  }, [leafShape]);

  // Leaf Material - Deep Forest Green (#28593B) with Golden Highlights (#D4AF37)
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#28593B'),
      roughness: 0.4,
      metalness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const mouseX = (state.pointer.x * 2);
    const mouseY = (state.pointer.y * 2);

    particles.forEach((p, i) => {
      p.x += p.speedX + Math.sin(time + i) * 0.002;
      p.y += p.speedY + Math.cos(time + i) * 0.002;
      p.rotX += 0.003;
      p.rotY += 0.004;

      if (p.x < -16) p.x = 16;
      if (p.x > 16) p.x = -16;
      if (p.y < -12) p.y = 12;
      if (p.y > 12) p.y = -12;

      dummy.position.set(p.x + mouseX * 0.35, p.y + mouseY * 0.35, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
    />
  );
}

const MataAtlantica3D = memo(function MataAtlantica3D() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Deep Musgo #0A140E Ambient Lighting */}
        <ambientLight intensity={0.3} color="#0A140E" />
        
        {/* Volumetric Forest Green (#28593B) and Gold (#D4AF37) Spotlights */}
        <spotLight
          position={[12, 16, 10]}
          angle={0.45}
          penumbra={1}
          intensity={5}
          color="#28593B"
        />
        <spotLight
          position={[-12, -10, -5]}
          angle={0.5}
          penumbra={1}
          intensity={3}
          color="#D4AF37"
        />
        <pointLight position={[0, 0, 6]} intensity={1.8} color="#28593B" />

        {/* 3D Floating Tropical Mata Atlântica Foliage */}
        <FloatingMataFoliage />
      </Canvas>
    </div>
  );
});

export default MataAtlantica3D;
