import { useMemo } from 'react';
import { NODE_BY_ID, BANKS } from '../../data/graph';
import { ZONES, GARAGES_GEOM, STREETS, FICTIONAL_ANNEX } from '../../data/zones';
import { routePolyline } from './geo';
import type { MapProps } from './Map3D';

/**
 * Accessible 2D fallback (also used for printing and when WebGL is unavailable). Same data as the
 * 3D twin, drawn top-down in the official site-map frame.
 */
export default function Map2D({ nodes, edges, stepNodes, originNode, destNode, focusLevel, showFictional, hereLabel, destLabel, highContrast, zoom }: MapProps & { zoom?: { x: number; y: number; r: number } }) {
  const route = useMemo(() => (nodes && edges ? routePolyline(nodes, edges) : []), [nodes, edges]);
  const stepSet = new Set(stepNodes);
  const o = originNode ? NODE_BY_ID[originNode] : null;
  const d = destNode ? NODE_BY_ID[destNode] : null;
  const segs = route.slice(1).map((p, i) => ({ a: route[i], b: p, lvl: p.level, inStep: !!(p.node && stepSet.has(p.node) && route[i].node && stepSet.has(route[i].node!)) }));
  const routeColor = highContrast ? '#c800a0' : '#e09b00';
  return (
    <svg viewBox={zoom ? `${zoom.x - zoom.r * 1.4} ${zoom.y - zoom.r} ${zoom.r * 2.8} ${zoom.r * 2}` : '40 40 1640 2140'} role="img" aria-label={`${hereLabel} → ${destLabel}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
      <rect x="40" y="40" width="1640" height="2140" fill={highContrast ? '#fff' : '#dfe7e3'} />
      {STREETS.map((s) => (
        <g key={s.name}>
          <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#59646d" strokeWidth={s.width} />
          <text x={s.from[1] === s.to[1] ? 420 : s.from[0]} y={s.from[1] === s.to[1] ? s.from[1] + 10 : 560} fill="#fff" fontSize="30" fontWeight="700" textAnchor="middle" transform={s.from[1] === s.to[1] ? undefined : `rotate(-90 ${s.from[0]} 560)`} fontFamily="system-ui">
            {s.name}
          </text>
        </g>
      ))}
      {GARAGES_GEOM.map((g) => (
        <g key={g.id}>
          <polygon points={g.polygon.map((p) => p.join(',')).join(' ')} fill="#b9c1c8" stroke="#7c8794" strokeWidth="4" />
          <text x={(g.polygon[0][0] + g.polygon[1][0]) / 2} y={(g.polygon[0][1] + g.polygon[2][1]) / 2 + 12} textAnchor="middle" fontSize="34" fontWeight="700" fill="#24323d" fontFamily="system-ui">
            P {g.label}
          </text>
        </g>
      ))}
      {ZONES.map((z) => {
        const onLevel = focusLevel === 'all' || z.levels.includes(focusLevel);
        const cx = z.polygon.reduce((a, p) => a + p[0], 0) / z.polygon.length;
        const cy = z.polygon.reduce((a, p) => a + p[1], 0) / z.polygon.length;
        return (
          <g key={z.id} opacity={onLevel ? 1 : 0.25}>
            <polygon points={z.polygon.map((p) => p.join(',')).join(' ')} fill={z.hex} fillOpacity={0.78} stroke="#ffffff" strokeWidth="4" />
            <text x={cx} y={cy + 30} textAnchor="middle" fontSize="110" fontWeight="800" fill="#fff" fontFamily="system-ui" opacity={0.9}>{z.id}</text>
          </g>
        );
      })}
      {showFictional && (
        <g>
          <polygon points={FICTIONAL_ANNEX.polygon.map((p) => p.join(',')).join(' ')} fill="#7c3aed" fillOpacity="0.35" stroke="#7c3aed" strokeDasharray="12 8" strokeWidth="5" />
          <text x="1540" y="1170" textAnchor="middle" fontSize="26" fontWeight="800" fill="#5b21b6" fontFamily="system-ui">FICTIONAL</text>
        </g>
      )}
      {Object.entries(BANKS).map(([id, b]) => (
        <g key={id}>
          <rect x={b.x - 18} y={b.y - 18} width="36" height="36" rx="6" fill="#23527c" />
          <text x={b.x} y={b.y + 10} textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff" fontFamily="system-ui">{id === 'GG' ? 'P' : id}</text>
        </g>
      ))}
      {segs.map((s, i) => {
        const dim = focusLevel !== 'all' && s.a.level !== focusLevel && s.b.level !== focusLevel;
        return (
          <line key={i} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={s.inStep ? (highContrast ? '#000' : '#d6336c') : routeColor} strokeWidth={s.inStep ? 26 : 16} strokeLinecap="round" opacity={dim ? 0.3 : 1} strokeDasharray={s.a.level !== s.b.level ? '4 18' : undefined} />
        );
      })}
      {o && (
        <g>
          <circle cx={o.x} cy={o.y} r="30" fill="#0f766e" stroke="#fff" strokeWidth="8" />
          <text x={o.x} y={o.y - 48} textAnchor="middle" fontSize="34" fontWeight="800" fill="#0f766e" stroke="#fff" strokeWidth="8" paintOrder="stroke" fontFamily="system-ui">{hereLabel}</text>
        </g>
      )}
      {d && (
        <g>
          <rect x={d.x - 26} y={d.y - 26} width="52" height="52" rx="8" fill="#c2410c" stroke="#fff" strokeWidth="8" />
          <text x={d.x} y={d.y + 70} textAnchor="middle" fontSize="34" fontWeight="800" fill="#c2410c" stroke="#fff" strokeWidth="8" paintOrder="stroke" fontFamily="system-ui">{destLabel}</text>
        </g>
      )}
      <g transform="translate(110 130)">
        <circle r="44" fill="#fff" opacity="0.85" />
        <path d="M0 -36 L14 8 L0 0 L-14 8 Z" fill="#15202b" />
        <text y="34" textAnchor="middle" fontSize="26" fontWeight="800" fontFamily="system-ui">N</text>
      </g>
    </svg>
  );
}
