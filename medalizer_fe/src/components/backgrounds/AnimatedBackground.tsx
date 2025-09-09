import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial, OrbitControls } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

export default function AnimatedBackground() {
  const sphere = random.inSphere(new Float32Array(5000), { radius: 2 });

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-50 via-blue-50 to-white">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} />
        <Points positions={sphere} stride={3} frustumCulled>
          <PointMaterial
            transparent
            color="#0087ff"
            size={0.02}
            sizeAttenuation={true}
            depthWrite={false}
          />
        </Points>
      </Canvas>
    </div>
  );
}
