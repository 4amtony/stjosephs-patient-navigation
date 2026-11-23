import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { BANKS, EDGES, NODE_BY_ID } from '../../data/graph';
import { ZONES, GARAGES_GEOM, STREETS, FICTIONAL_ANNEX } from '../../data/zones';
import { CHECKPOINTS } from '../../data/checkpoints';
import type { GEdge, Level } from '../../data/types';
import { bbox, FLOOR_H, GROUND_Y, routePolyline, toWorld, wx, wy, wz, type RoutePoint } from './geo';

export interface MapProps {
  nodes: string[] | null;
  edges: GEdge[] | null;
  /** node ids belonging to the current step */
  stepNodes: string[];
  originNode: string | null;
  destNode: string | null;
  focusLevel: Level | 'all';
  focusKey: string;
  reduceMotion: boolean;
  showCheckpoints: boolean;
  showFictional: boolean;
  hereLabel: string;
  destLabel: string;
  highContrast: boolean;
  onCheckpoint?: (id: string) => void;
}

function shapeFrom(poly: [number, number][]) {
  const s = new THREE.Shape();
  poly.forEach(([x, y], i) => (i ? s.lineTo(wx(x), -wz(y)) : s.moveTo(wx(x), -wz(y))));
  s.closePath();
  return s;
}

function Slab({ poly, level, color, opacity, thickness = 0.16, visible = true, wire = true }: { poly: [number, number][]; level: number; color: string; opacity: number; thickness?: number; visible?: boolean; wire?: boolean }) {
  const geo = useMemo(() => new THREE.ExtrudeGeometry(shapeFrom(poly), { depth: thickness, bevelEnabled: false }), [poly, thickness]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 30), [geo]);
  if (!visible) return null;
  return (
    <group position={[0, wy(level), 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geo} renderOrder={1}>
        <meshStandardMaterial color={color} transparent opacity={opacity} depthWrite={opacity > 0.5} roughness={0.85} metalness={0} />
      </mesh>
      {wire && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={color} transparent opacity={Math.min(1, opacity + 0.35)} />
        </lineSegments>
      )}
    </group>
  );
}

function Shaft({ x, y, from, to, label, active }: { x: number; y: number; from: number; to: number; label: string; active: boolean }) {
  const h = (to - from) * FLOOR_H + 1.2;
  return (
    <group position={[wx(x), wy(from) + h / 2 - 0.2, wz(y)]}>
      <mesh>
        <boxGeometry args={[0.9, h, 0.9]} />
        <meshStandardMaterial color={active ? '#e3a21a' : '#33424f'} transparent opacity={active ? 0.55 : 0.28} />
      </mesh>
      <Html position={[0, h / 2 + 0.6, 0]} center zIndexRange={[5, 0]}>
        <div className="map-label">{label}</div>
      </Html>
    </group>
  );
}

function CorridorNet({ levels, opacity }: { levels: Set<number>; opacity: number }) {
  const geo = useMemo(() => {
    const pos: number[] = [];
    for (const e of EDGES) {
      if (e.kind === 'elevator' || e.kind === 'restricted') continue;
      const a = NODE_BY_ID[e.a];
      const b = NODE_BY_ID[e.b];
      if (!levels.has(a.level) || a.level !== b.level) continue;
      pos.push(wx(a.x), wy(a.level) + 0.2, wz(a.y), wx(b.x), wy(b.level) + 0.2, wz(b.y));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [levels]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#ffffff" transparent opacity={opacity} />
    </lineSegments>
  );
}

function Mover({ points, reduceMotion }: { points: [number, number, number][]; reduceMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => (points.length > 1 ? new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.05) : null), [points]);
  useFrame(({ clock }) => {
    if (!ref.current || !curve) return;
    const t = reduceMotion ? 1 : (clock.getElapsedTime() * 0.12) % 1;
    ref.current.position.copy(curve.getPointAt(t));
  });
  if (!curve) return null;
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.42, 20, 20]} />
      <meshStandardMaterial color="#fff6d6" emissive="#f4b400" emissiveIntensity={1.4} />
    </mesh>
  );
}

function Marker({ p, color, label, kind }: { p: RoutePoint; color: string; label: string; kind: 'pin' | 'dest' }) {
  const [x, y, z] = toWorld(p, 0.2);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ring.current) {
      const s = 1 + ((clock.getElapsedTime() * 0.8) % 1) * 1.6;
      ring.current.scale.set(s, s, s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - ((clock.getElapsedTime() * 0.8) % 1));
    }
  });
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 1.1, 0]}>
        {kind === 'pin' ? <sphereGeometry args={[0.55, 24, 24]} /> : <cylinderGeometry args={[0.12, 0.12, 2.2, 10]} />}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      {kind === 'dest' && (
        <mesh position={[0.55, 1.85, 0]}>
          <boxGeometry args={[1.0, 0.6, 0.06]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      {kind === 'pin' && (
        <mesh position={[0, 0.45, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.42, 0.9, 20]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.6, 0.85, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <Html position={[0, 3.0, 0]} center zIndexRange={[20, 10]}>
        <div className={`map-label ${kind === 'pin' ? 'pin' : 'dest'}`}>{label}</div>
      </Html>
    </group>
  );
}

function CameraRig({ target, focusKey, reduceMotion }: { target: { center: THREE.Vector3; radius: number; vertical?: boolean }; focusKey: string; reduceMotion: boolean }) {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  const controls = useThree((st) => st.controls) as unknown as OrbitControlsImpl | null;
  const anim = useRef<{ t: number; fromP: THREE.Vector3; toP: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3 } | null>(null);
  const placed = useRef(false);
  useEffect(() => {
    if (!controls) return;
    const dist = Math.max(18, target.radius * 3.1);
    const toT = target.center.clone();
    const toP = toT.clone().add(target.vertical ? new THREE.Vector3(dist * 0.75, dist * 0.32, dist * 0.85) : new THREE.Vector3(dist * 0.5, dist * 0.8, dist * 0.7));
    if (reduceMotion || !placed.current) {
      placed.current = true;
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      return;
    }
    anim.current = { t: 0, fromP: camera.position.clone(), toP, fromT: controls.target.clone(), toT };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, controls]);
  useFrame((_, dt) => {
    const a = anim.current;
    if (!a || !controls) return;
    a.t = Math.min(1, a.t + dt / 0.9);
    const k = 1 - Math.pow(1 - a.t, 3);
    camera.position.lerpVectors(a.fromP, a.toP, k);
    controls.target.lerpVectors(a.fromT, a.toT, k);
    controls.update();
    if (a.t >= 1) anim.current = null;
  });
  return null;
}

export default function Map3D(props: MapProps) {
  const { nodes, edges, stepNodes, originNode, destNode, focusLevel, focusKey, reduceMotion, showCheckpoints, showFictional, hereLabel, destLabel, highContrast } = props;

  const route = useMemo(() => (nodes && edges ? routePolyline(nodes, edges) : []), [nodes, edges]);
  const routeLevels = useMemo(() => new Set(route.map((p) => p.level)), [route]);
  const worldRoute = useMemo(() => route.map((p) => toWorld(p)), [route]);

  const stepSet = useMemo(() => new Set(stepNodes), [stepNodes]);
  const stepPts = useMemo(() => {
    const idx = route.map((p, i) => (p.node && stepSet.has(p.node) ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) return [] as [number, number, number][];
    const lo = Math.min(...idx);
    const hi = Math.max(...idx);
    return worldRoute.slice(lo, hi + 1);
  }, [route, worldRoute, stepSet]);

  const focusTarget = useMemo(() => {
    const ends = [originNode, destNode].filter(Boolean).map((id) => NODE_BY_ID[id!]).filter(Boolean).map((n) => ({ x: n.x, y: n.y, level: n.level }));
    const pts = focusKey.startsWith('step') && stepNodes.length ? stepNodes.map((n) => NODE_BY_ID[n]).filter(Boolean).map((n) => ({ x: n.x, y: n.y, level: n.level })) : route.length ? route : ends.length ? ends : [{ x: 820, y: 1150, level: 1 as Level }];
    const b = bbox(pts);
    const center = new THREE.Vector3((b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2);
    const horiz = Math.max(b.max[0] - b.min[0], b.max[2] - b.min[2]);
    const vert = b.max[1] - b.min[1];
    const radius = Math.max(horiz, vert * 1.3, focusKey.startsWith('step') ? 10 : 20) / 2;
    return { center, radius, vertical: vert > horiz * 0.6 };
  }, [focusKey, stepNodes, route, originNode, destNode]);

  const levelVisible = (l: number) => focusLevel === 'all' || l <= focusLevel;
  const slabOpacity = (l: number) => {
    if (focusLevel !== 'all') return l === focusLevel ? 0.82 : 0.07;
    if (!route.length) return l === 1 ? 0.6 : 0.16;
    return routeLevels.has(l as Level) ? 0.5 : 0.1;
  };
  const netLevels = useMemo(() => (focusLevel === 'all' ? routeLevels : new Set([focusLevel])) as Set<number>, [focusLevel, routeLevels]);

  const origin = originNode ? NODE_BY_ID[originNode] : null;
  const dest = destNode ? NODE_BY_ID[destNode] : null;
  const routeColor = highContrast ? '#ff00c8' : '#f2a900';

  return (
    <Canvas camera={{ position: [32, 46, 58], fov: 42, near: 0.5, far: 600 }} dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <color attach="background" args={[highContrast ? '#ffffff' : '#e3eaec']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[30, 60, 20]} intensity={0.9} />
      <hemisphereLight args={['#ffffff', '#8aa0a8', 0.35]} />

      {/* ground + streets */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y, 0]}>
        <planeGeometry args={[110, 140]} />
        <meshStandardMaterial color={highContrast ? '#f2f2f2' : '#cfd8d3'} transparent opacity={0.8} />
      </mesh>
      {STREETS.map((s) => {
        const horizontal = s.from[1] === s.to[1];
        const len = horizontal ? (s.to[0] - s.from[0]) / 20 : (s.to[1] - s.from[1]) / 20;
        const cx = wx((s.from[0] + s.to[0]) / 2);
        const cz = wz((s.from[1] + s.to[1]) / 2);
        return (
          <group key={s.name}>
            <mesh rotation={[-Math.PI / 2, 0, horizontal ? 0 : Math.PI / 2]} position={[cx, GROUND_Y + 0.02, cz]}>
              <planeGeometry args={[len, s.width / 20]} />
              <meshStandardMaterial color="#59646d" />
            </mesh>
            <Html position={[horizontal ? wx(s.from[0] + 260) : cx, GROUND_Y + 0.4, horizontal ? cz : wz(s.from[1] + 330)]} center zIndexRange={[2, 0]}>
              <div className="map-label street">{s.name}</div>
            </Html>
          </group>
        );
      })}

      {/* zones by level */}
      {ZONES.map((z) =>
        z.levels.map((l) => (
          <Slab key={`${z.id}${l}`} poly={z.polygon} level={l} color={z.hex} opacity={slabOpacity(l)} visible={levelVisible(l)} wire={focusLevel === 'all' ? routeLevels.has(l) || l === 1 : l === focusLevel} />
        )),
      )}
      {ZONES.map((z) => {
        const top = Math.max(...z.levels);
        const cx = z.polygon.reduce((a, p) => a + p[0], 0) / z.polygon.length;
        const cy = z.polygon.reduce((a, p) => a + p[1], 0) / z.polygon.length;
        return (
          <Html key={`lbl${z.id}`} position={[wx(cx), wy(focusLevel === 'all' ? top : Math.min(top, focusLevel)) + 1.2, wz(cy)]} center zIndexRange={[4, 0]}>
            <div className="map-label zone" style={{ color: z.hex === '#1f4b35' ? '#d6f5e3' : '#fff' }}>{z.id}</div>
          </Html>
        );
      })}
      {GARAGES_GEOM.map((g) =>
        g.levels.map((l) => <Slab key={`${g.id}${l}`} poly={g.polygon} level={l} color={g.hex} opacity={focusLevel === 'all' ? (routeLevels.has(l) ? 0.35 : 0.12) : l === focusLevel ? 0.6 : 0.05} visible={levelVisible(l)} thickness={0.1} />),
      )}
      {GARAGES_GEOM.map((g) => (
        <Html key={`gl${g.id}`} position={[wx((g.polygon[0][0] + g.polygon[1][0]) / 2), wy(Math.max(...g.levels)) + 1, wz((g.polygon[0][1] + g.polygon[2][1]) / 2)]} center zIndexRange={[3, 0]}>
          <div className="map-label">P · {g.label}</div>
        </Html>
      ))}
      {showFictional && (
        <group>
          <Slab poly={FICTIONAL_ANNEX.polygon} level={0} color="#7c3aed" opacity={0.35} thickness={1.6} />
          <Html position={[wx(1540), wy(0) + 2.6, wz(1255)]} center zIndexRange={[6, 0]}>
            <div className="map-label fiction">FICTIONAL TRAINING ANNEX</div>
          </Html>
        </group>
      )}

      {/* elevator shafts */}
      {Object.entries(BANKS).map(([id, b]) => (
        <Shaft key={id} x={b.x} y={b.y} from={Math.min(...b.levels)} to={Math.max(...b.levels)} label={id === 'GG' ? 'P' : id} active={!!edges?.some((e) => e.kind === 'elevator' && NODE_BY_ID[e.a].bank === id)} />
      ))}

      <CorridorNet levels={netLevels} opacity={focusLevel === 'all' ? 0.5 : 0.8} />

      {/* route */}
      {worldRoute.length > 1 && (
        <>
          <Line points={worldRoute} color={routeColor} lineWidth={8} transparent opacity={0.95} />
          <Line points={worldRoute} color="#ffffff" lineWidth={2} dashed dashSize={0.6} gapSize={0.5} transparent opacity={0.8} />
          {stepPts.length > 1 && <Line points={stepPts} color={highContrast ? '#000000' : '#d6336c'} lineWidth={10} />}
          <Mover points={worldRoute} reduceMotion={reduceMotion} />
        </>
      )}
      {origin && <Marker p={{ x: origin.x, y: origin.y, level: origin.level }} color="#0f766e" label={hereLabel} kind="pin" />}
      {dest && <Marker p={{ x: dest.x, y: dest.y, level: dest.level }} color="#c2410c" label={destLabel} kind="dest" />}

      {showCheckpoints &&
        CHECKPOINTS.filter((c) => c.kind !== 'training' && levelVisible(NODE_BY_ID[c.node].level)).map((c) => {
          const n = NODE_BY_ID[c.node];
          return (
            <group key={c.id} position={[wx(n.x) + 0.7, wy(n.level) + 0.7, wz(n.y) + 0.7]}>
              <mesh onClick={(e) => { e.stopPropagation(); props.onCheckpoint?.(c.id); }}>
                <boxGeometry args={[0.6, 0.6, 0.12]} />
                <meshStandardMaterial color="#ffffff" emissive="#9fb5c2" emissiveIntensity={0.4} />
              </mesh>
            </group>
          );
        })}

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI * 0.47} minDistance={8} maxDistance={190} />
      <CameraRig target={focusTarget} focusKey={focusKey} reduceMotion={reduceMotion} />
    </Canvas>
  );
}
