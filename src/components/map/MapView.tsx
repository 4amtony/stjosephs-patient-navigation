import { Component, lazy, Suspense, useMemo, useState, type ReactNode } from 'react';
import { NODE_BY_ID } from '../../data/graph';
import type { GEdge, Level } from '../../data/types';
import { useI18n } from '../../i18n/I18nProvider';
import { Layers, MapIcon, Qr } from '../Icons';
import { hasWebGL } from './geo';
import Map2D from './Map2D';
import type { MapProps } from './Map3D';

const Map3D = lazy(() => import('./Map3D'));

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}

export interface MapViewProps {
  nodes: string[] | null;
  edges: GEdge[] | null;
  stepNodes: string[];
  originNode: string | null;
  destNode: string | null;
  focusKey: string;
  reduceMotion: boolean;
  highContrast: boolean;
  showFictional?: boolean;
  hereLabel: string;
  destLabel: string;
  /** levels to offer in the floor rail (defaults: route levels) */
  onOverview?: () => void;
  onFocusStep?: () => void;
  compact?: boolean;
  onCheckpoint?: (id: string) => void;
}

export function MapView(p: MapViewProps) {
  const { t } = useI18n();
  const webgl = useMemo(() => hasWebGL(), []);
  const [mode, setMode] = useState<'3d' | '2d'>(webgl ? '3d' : '2d');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [showCp, setShowCp] = useState(false);

  const routeLevels = useMemo(() => Array.from(new Set((p.nodes ?? []).map((n) => NODE_BY_ID[n].level))).sort((a, b) => b - a) as Level[], [p.nodes]);
  const allLevels: Level[] = [6, 5, 4, 3, 2, 1, 0, -1];
  const props: MapProps = {
    nodes: p.nodes, edges: p.edges, stepNodes: p.stepNodes, originNode: p.originNode, destNode: p.destNode, focusLevel: level,
    focusKey: `${p.focusKey}|${level}`, reduceMotion: p.reduceMotion, showCheckpoints: showCp, showFictional: !!p.showFictional,
    hereLabel: p.hereLabel, destLabel: p.destLabel, highContrast: p.highContrast, onCheckpoint: p.onCheckpoint,
  };
  const two = <Map2D {...props} />;
  return (
    <div className="map-pane" role="region" aria-label={t('map.desc', { from: p.hereLabel, to: p.destLabel })}>
      {mode === '3d' ? (
        <Boundary fallback={two}>
          <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', height: '100%' }} className="muted">{t('map.loading')}</div>}>
            <Map3D {...props} />
          </Suspense>
        </Boundary>
      ) : (
        two
      )}
      <div className="map-overlay top">
        {webgl && (
          <button className="map-btn" aria-pressed={mode === '3d'} onClick={() => setMode(mode === '3d' ? '2d' : '3d')}>
            <MapIcon size={16} /> {mode === '3d' ? t('navi.map2d') : t('navi.mapView')}
          </button>
        )}
        {p.onOverview && (
          <button className="map-btn" onClick={() => { setLevel('all'); p.onOverview!(); }}>
            <Layers size={16} /> {t('navi.overview')}
          </button>
        )}
        {p.onFocusStep && (
          <button className="map-btn" onClick={p.onFocusStep}>
            ◎ {t('navi.focus')}
          </button>
        )}
        <button className="map-btn" aria-pressed={showCp} onClick={() => setShowCp(!showCp)} title="QR">
          <Qr size={16} /> QR
        </button>
      </div>
      {!p.compact && (
        <div className="floor-rail" role="group" aria-label={t('navi.allFloors')}>
          <button aria-pressed={level === 'all'} onClick={() => setLevel('all')} title={t('navi.allFloors')}>
            <Layers size={16} />
          </button>
          {allLevels.map((l) => (
            <button key={l} aria-pressed={level === l} className={routeLevels.includes(l) ? 'on-route' : 'off-route'} onClick={() => setLevel(l)} aria-label={l === -1 ? t('level.tunnel') : t('level.n', { level: l })}>
              {l === -1 ? 'B' : l}
            </button>
          ))}
        </div>
      )}
      <div className="map-overlay bottom">
        <span className="map-legend">{t('navi.mapApprox')}</span>
      </div>
    </div>
  );
}
