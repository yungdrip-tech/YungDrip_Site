"use client";

import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import {
  Component,
  Suspense,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Box3, Vector3, ACESFilmicToneMapping } from "three";
import {
  GARMENT_FIT,
  STYLE_AI_BODY_MODEL_URL,
  STYLE_AI_DEMO_MODES,
  STYLE_AI_FULL_MODEL_URL,
  STYLE_AI_JEANS_MODEL_URL,
  STYLE_AI_SINGLE_MODEL_URL,
  STYLE_AI_TSHIRT_MODEL_URL,
} from "@/lib/style-ai-test-model";

const BODY_SCALE = {
  Slim: 0.94,
  Athletic: 1.03,
  Average: 1,
  "Plus Size": 1.1,
};

function prepareScene(scene, renderOrder) {
  const clone = scene.clone(true);
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.renderOrder = renderOrder;
      if (child.material) {
        child.material.envMapIntensity = 0.35;
        child.material.needsUpdate = true;
      }
    }
  });
  return clone;
}

// Measure ONLY the base body — never the full assembly (that inflates the bbox with clothes).
function fitGarmentToBody(garment, bodyAnchor, fit) {
  garment.position.set(0, 0, 0);
  garment.rotation.set(0, 0, 0);
  garment.scale.set(1, 1, 1);
  garment.updateMatrixWorld(true);

  const bodyBox = new Box3().setFromObject(bodyAnchor);
  const bodySize = bodyBox.getSize(new Vector3());
  const bodyCenter = bodyBox.getCenter(new Vector3());

  if (bodySize.x <= 0 || bodySize.y <= 0) return;

  const garmentBox = new Box3().setFromObject(garment);
  const garmentSize = garmentBox.getSize(new Vector3());
  if (garmentSize.x <= 0 || garmentSize.y <= 0) return;

  const scaleX = (bodySize.x * fit.widthRatio) / garmentSize.x;
  const scaleY = (bodySize.y * fit.heightRatio) / garmentSize.y;
  const scaleZ = (bodySize.z * fit.depthRatio) / garmentSize.z;
  garment.scale.set(scaleX, scaleY, scaleZ);
  garment.updateMatrixWorld(true);

  garmentBox.setFromObject(garment);

  if (fit.alignBottom) {
    garment.position.set(
      bodyCenter.x - (garmentBox.min.x + garmentBox.max.x) / 2,
      bodyBox.min.y - garmentBox.min.y,
      bodyCenter.z -
        (garmentBox.min.z + garmentBox.max.z) / 2 +
        bodySize.z * fit.depthNudge
    );
    return;
  }

  const garmentCenter = garmentBox.getCenter(new Vector3());
  const targetY = bodyBox.min.y + bodySize.y * fit.anchorYRatio;

  garment.position.set(
    bodyCenter.x - garmentCenter.x,
    targetY - garmentCenter.y,
    bodyCenter.z - garmentCenter.z + bodySize.z * fit.depthNudge
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-black/60">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-black" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">
          Loading {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#f8f5f0] p-6 text-center">
          <p className="max-w-xs text-xs font-medium uppercase tracking-[0.16em] text-black/45">
            Unable to load the 3D preview. Please try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

class SafeEnvironment extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return (
      <Suspense fallback={null}>
        <Environment preset="warehouse" environmentIntensity={0.35} background={false} />
      </Suspense>
    );
  }
}

function StandaloneModel({ url, bodyType }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => prepareScene(scene, 0), [scene]);
  const scale = BODY_SCALE[bodyType] ?? BODY_SCALE.Average;

  return (
    <Bounds fit clip observe margin={1.15}>
      <group scale={scale}>
        <primitive object={model} />
      </group>
    </Bounds>
  );
}

function CharacterModel({ bodyType, showTshirt, showJeans }) {
  const bodyRef = useRef(null);
  const jeansRef = useRef(null);
  const tshirtRef = useRef(null);

  const { scene: bodyScene } = useGLTF(STYLE_AI_BODY_MODEL_URL);
  const { scene: tshirtScene } = useGLTF(STYLE_AI_TSHIRT_MODEL_URL);
  const { scene: jeansScene } = useGLTF(STYLE_AI_JEANS_MODEL_URL);

  const body = useMemo(() => prepareScene(bodyScene, 0), [bodyScene]);
  const tshirt = useMemo(() => prepareScene(tshirtScene, 2), [tshirtScene]);
  const jeans = useMemo(() => prepareScene(jeansScene, 1), [jeansScene]);

  const scale = BODY_SCALE[bodyType] ?? BODY_SCALE.Average;

  useLayoutEffect(() => {
    if (!bodyRef.current) return;

    if (showJeans && jeansRef.current) {
      fitGarmentToBody(jeansRef.current, bodyRef.current, GARMENT_FIT.jeans);
    }
    if (showTshirt && tshirtRef.current) {
      fitGarmentToBody(tshirtRef.current, bodyRef.current, GARMENT_FIT.tshirt);
    }
  }, [showTshirt, showJeans, bodyType, body, tshirt, jeans]);

  return (
    <Bounds fit clip observe margin={1.15}>
      <group scale={scale}>
        {/* bodyRef must contain ONLY the base mesh — clothes are siblings */}
        <group ref={bodyRef}>
          <primitive object={body} />
        </group>
        {showJeans ? (
          <group ref={jeansRef}>
            <primitive object={jeans} />
          </group>
        ) : null}
        {showTshirt ? (
          <group ref={tshirtRef}>
            <primitive object={tshirt} />
          </group>
        ) : null}
      </group>
    </Bounds>
  );
}

useGLTF.preload(STYLE_AI_BODY_MODEL_URL);
useGLTF.preload(STYLE_AI_TSHIRT_MODEL_URL);
useGLTF.preload(STYLE_AI_JEANS_MODEL_URL);
useGLTF.preload(STYLE_AI_SINGLE_MODEL_URL);
useGLTF.preload(STYLE_AI_FULL_MODEL_URL);

export default function StyleAIMannequin({
  viewMode = STYLE_AI_DEMO_MODES.outfit,
  bodyType = "Average",
  showTshirt = false,
  showJeans = false,
}) {
  const isOutfit = viewMode === STYLE_AI_DEMO_MODES.outfit;
  const standaloneUrl =
    viewMode === STYLE_AI_DEMO_MODES.full
      ? STYLE_AI_FULL_MODEL_URL
      : viewMode === STYLE_AI_DEMO_MODES.single
      ? STYLE_AI_SINGLE_MODEL_URL
      : null;

  return (
    <ViewerErrorBoundary>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.9, 4.2], fov: 42 }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 0.82,
        }}
        style={{ background: "#e8e4dc", borderRadius: "0 1.5rem 1.5rem 0" }}
        key={viewMode}
      >
        <color attach="background" args={["#e8e4dc"]} />
        <ambientLight intensity={0.28} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={0.75}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.18} />
        <pointLight position={[0, 4, 3]} intensity={0.08} />

        <Suspense fallback={<Loader />}>
          {isOutfit ? (
            <CharacterModel
              bodyType={bodyType}
              showTshirt={showTshirt}
              showJeans={showJeans}
            />
          ) : (
            <StandaloneModel url={standaloneUrl} bodyType={bodyType} />
          )}
          <SafeEnvironment />
        </Suspense>

        <ContactShadows
          position={[0, -1.0, 0]}
          opacity={0.5}
          scale={10}
          blur={2.8}
          far={4}
          resolution={1024}
        />

        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          minDistance={2.4}
          maxDistance={7}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI * 0.62}
          target={[0, 0.2, 0]}
        />
      </Canvas>
    </ViewerErrorBoundary>
  );
}
