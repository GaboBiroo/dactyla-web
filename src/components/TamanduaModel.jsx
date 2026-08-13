import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PresentationControls, Html } from '@react-three/drei';
// import { useGLTF } from '@react-three/drei'; // UNCOMMENT WHEN /public/models/Tamandua.gltf IS UPLOADED

/* 
===================================================================
INSTRUÇÕES PARA ATIVAR O MODELO GLTF REAL (.gltf / .glb):
1. Coloque o seu arquivo 3D na pasta: public/models/Tamandua.gltf
2. Descomente a importação do 'useGLTF' acima.
3. Descomente o componente 'RealGLTFModel' abaixo.
4. No componente 'TamanduaModel', substitua <FallbackTamanduaMesh /> por <RealGLTFModel url="/models/Tamandua.gltf" />
===================================================================
*/

/*
function RealGLTFModel({ url = '/models/Tamandua.gltf' }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
    }
  });

  return <primitive ref={ref} object={scene} scale={1.5} position={[0, -0.5, 0]} />;
}
*/

// 3D Anatomical Fallback Mesh Placeholder (Failsafe Mode - Guaranteed 100% Stability)
function FallbackTamanduaMesh() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Curved Long Snout (Focinho do Tamanduá-mirim) */}
      <mesh position={[-1.2, -0.2, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.3, 2.2, 16]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Head Node */}
      <mesh position={[-0.2, 0.3, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial color="#28593B" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Body Facet (Colete Escuro #0A140E) */}
      <mesh position={[1.0, 0.1, 0]}>
        <capsuleGeometry args={[0.7, 1.8, 8, 16]} />
        <meshStandardMaterial color="#0A140E" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Claws Facet (Garras Primitivas) */}
      <mesh position={[-0.6, -0.8, 0.3]} rotation={[0.4, 0, 0.4]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.6, -0.8, -0.3]} rotation={[-0.4, 0, 0.4]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Explicit Tag Label */}
      <Html position={[0, 1.5, 0]} center>
        <div className="px-3 py-1 bg-[#0A140E]/90 border border-[#D4AF37] text-[#D4AF37] font-mono-code text-[10px] uppercase font-bold tracking-wider rounded whitespace-nowrap shadow-lg">
          MODELO 3D TAMANDUÁ [Substituir por /models/Tamandua.gltf]
        </div>
      </Html>
    </group>
  );
}

export default function TamanduaModel() {
  return (
    <PresentationControls
      global
      config={{ mass: 2, tension: 500 }}
      snap={{ mass: 4, tension: 300 }}
      rotation={[0, 0.3, 0]}
      polar={[-Math.PI / 4, Math.PI / 4]}
      azimuth={[-Math.PI / 3, Math.PI / 3]}
    >
      <FallbackTamanduaMesh />
    </PresentationControls>
  );
}
