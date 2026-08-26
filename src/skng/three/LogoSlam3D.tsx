import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import { Quaternion, Vector2, Vector3 } from "three";
import { BRAND } from "../brand";

/**
 * The brand mark rebuilt as a lit 3D sculpture, with a real bloom pass.
 *
 * The mark is a network of nodes over a map of Nigeria, and `NetworkGraph` in
 * `../ui.tsx` already draws that motif in 2D. This is the same idea with depth:
 * a hub, six nodes on a ring, and spokes wiring them together, slammed into
 * frame and lit in brand green.
 *
 * Nothing here loads a texture. `useLoader` suspends, and a suspended subtree
 * during a render pass produces blank frames rather than an error — which is
 * exactly the kind of failure that survives a green exit code. The geometry is
 * built from numbers, and the actual logo PNG is composited over the top as a
 * flat <Img>, which needs no async anything.
 */

const NODES = 6;
const RING_RADIUS = 1.85;

const ringPositions = Array.from({ length: NODES }, (_, i) => {
  const a = (i / NODES) * Math.PI * 2;
  return new Vector3(Math.cos(a) * RING_RADIUS, Math.sin(a) * RING_RADIUS, 0);
});

/** Cylinders default to pointing along +Y, so each spoke has to be aimed. */
const spokeFor = (target: Vector3) => {
  const dir = target.clone().normalize();
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir);
  return {
    position: target.clone().multiplyScalar(0.5),
    quaternion,
    length: target.length(),
  };
};

const SPOKES = ringPositions.map(spokeFor);

const Sculpture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slam = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.8 },
    durationInFrames: 34,
  });

  const spin = interpolate(frame, [0, 240], [-0.5, 0.5]);
  const tilt = interpolate(frame, [0, 240], [0.35, -0.1]);

  return (
    <group scale={slam} rotation={[tilt * 0.3, spin, 0]}>
      {/* Hub */}
      <mesh>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color={BRAND.surface}
          emissive={BRAND.secondary}
          emissiveIntensity={0.5}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {SPOKES.map((s, i) => (
        <mesh key={`spoke-${i}`} position={s.position} quaternion={s.quaternion}>
          <cylinderGeometry args={[0.022, 0.022, s.length, 8]} />
          <meshStandardMaterial
            color={BRAND.surface}
            emissive={BRAND.accent}
            emissiveIntensity={0.9}
            roughness={0.5}
          />
        </mesh>
      ))}

      {ringPositions.map((p, i) => {
        // Nodes arrive after the hub, one beat apart, so the network assembles
        // rather than appearing.
        const pop = spring({
          frame: frame - 8 - i * 3,
          fps,
          config: { damping: 10, mass: 0.5 },
          durationInFrames: 26,
        });
        return (
          <mesh key={`node-${i}`} position={p} scale={pop}>
            <sphereGeometry args={[0.24, 24, 24]} />
            <meshStandardMaterial
              color={BRAND.white}
              emissive={BRAND.secondary}
              emissiveIntensity={0.85}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export type LogoSlam3DProps = {
  /** Turn the postprocessing pass off to compare, or if it ever misbehaves. */
  effects?: boolean;
  /** Overlay the flat logo PNG once the sculpture has landed. */
  showMark?: boolean;
};

export const LogoSlam3D: React.FC<LogoSlam3DProps> = ({
  effects = true,
  showMark = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const aberrationOffset = React.useMemo(() => new Vector2(0.0016, 0.0012), []);

  const markIn = spring({
    frame: frame - 26,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.primary }}>
      {/*
        Camera distance is set by the *horizontal* field of view, not the
        vertical one. At fov 50 the visible half-height is d*tan(25deg), and a
        1080x1920 frame is 0.5625 as wide as it is tall — so half-width is only
        d*0.26. The ring needs ~2.3 units of half-width, which puts the camera
        at 9+ rather than the 6 that would frame it fine in landscape.
      */}
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 6]} intensity={2.4} color={BRAND.secondary} />
        <pointLight position={[-5, -3, 4]} intensity={40} color={BRAND.white} distance={20} />
        <pointLight position={[0, 0, -4]} intensity={30} color={BRAND.accent} distance={18} />

        <Sculpture />

        {effects ? (
          <EffectComposer>
            {/*
              luminanceThreshold is what stops bloom becoming fog. Below ~0.45
              the mid-tones bloom too, every surface blows out to white and the
              mark stops reading as a shape at all.
            */}
            <Bloom
              intensity={0.85}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.6}
              mipmapBlur
            />
            <ChromaticAberration offset={aberrationOffset} />
          </EffectComposer>
        ) : (
          <></>
        )}
      </ThreeCanvas>

      {showMark ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: markIn,
          }}
        >
          <div
            style={{
              width: 210,
              height: 210,
              borderRadius: "50%",
              backgroundColor: BRAND.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${0.86 + markIn * 0.14})`,
              boxShadow: "0 0 90px rgba(228,244,241,0.45)",
            }}
          >
            <Img src={staticFile("skng-logo.png")} style={{ width: 168 }} />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
