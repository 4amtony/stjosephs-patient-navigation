import { NODE_BY_ID, BANKS } from './graph';
import type { Cardinal, Level, Provenance, ZoneId } from './types';

/**
 * PROPOSED public QR checkpoints. None of these are installed at the hospital.
 * A QR code encodes only `?checkpoint=<ID>` — a fixed location id. It is not a token, grants no
 * access, and carries no personal data. Each sign has a mounting orientation so that "stand
 * facing the sign" gives the app a known heading for the first turn instruction.
 */
export interface Checkpoint {
  id: string;
  node: string;
  /** English place name as it would appear on the sign */
  name: string;
  zone: ZoneId;
  level: Level;
  /** heading of a person standing at the sign as the app assumes it */
  facing?: Cardinal;
  mounting: string;
  kind: 'entrance' | 'garage' | 'lift' | 'junction' | 'training';
  status: Provenance;
}

const lift = (bank: 'A' | 'B' | 'C' | 'D', level: Level): Checkpoint => ({
  id: `ZONE_${bank}_LIFT_LEVEL_${level}`,
  node: `${bank}_EL_${level}`,
  name: `Zone ${bank} elevator lobby – Level ${level} (${bank}${level})`,
  zone: bank,
  level,
  facing: BANKS[bank].exit,
  mounting: `On the wall facing the Zone ${bank} elevator doors, so a person stepping out of the elevator faces it (${BANKS[bank].exit}).`,
  kind: 'lift',
  status: 'DERIVED',
});

export const CHECKPOINTS: Checkpoint[] = [
  { id: 'ENTRANCE_1', node: 'E1', name: 'Grosvenor Entrance 1 (main entrance) – Zone A', zone: 'A', level: 1, facing: 'N', mounting: 'Inside the vestibule before the sliding doors, facing into the Zone A lobby.', kind: 'entrance', status: 'OFFICIAL' },
  { id: 'ENTRANCE_2', node: 'E2', name: 'Grosvenor Entrance 2 (Urgent Care entrance) – Zone B', zone: 'B', level: 0, facing: 'N', mounting: 'Inside the doors, before the information desk, facing into the corridor.', kind: 'entrance', status: 'OFFICIAL' },
  { id: 'ENTRANCE_3', node: 'E3', name: 'Wellington Entrance 3 (at the ramp) – Zone B', zone: 'B', level: 0, facing: 'W', mounting: 'Inside the sliding doors at the ramp entrance.', kind: 'entrance', status: 'OFFICIAL' },
  { id: 'ENTRANCE_4', node: 'E4', name: 'Cheapside Entrance 4 – Zone C lobby', zone: 'C', level: 0, facing: 'S', mounting: 'Inside the entrance, facing into the Zone C lobby.', kind: 'entrance', status: 'OFFICIAL' },
  { id: 'GROSVENOR_GARAGE', node: 'GG_EL_P', name: 'Grosvenor Parking Garage – north-west elevator lobby', zone: 'GG', level: 1, facing: 'N', mounting: 'Beside the pay stations in the north-west elevator lobby.', kind: 'garage', status: 'OFFICIAL' },
  { id: 'GROSVENOR_TUNNEL', node: 'GG_EL_T', name: 'Tunnel level (Level B) – Grosvenor garage elevators', zone: 'GG', level: -1, facing: 'N', mounting: 'Opposite the garage elevator doors at Level B (tunnel).', kind: 'garage', status: 'OFFICIAL' },
  { id: 'CHEAPSIDE_GARAGE', node: 'CS_PARK', name: 'Cheapside Street parking garage (underground)', zone: 'CG', level: -1, mounting: 'At the garage elevator lobby.', kind: 'garage', status: 'OFFICIAL' },
  { id: 'COMPASS_LEVEL_0', node: 'COMPASS_0', name: 'Compass intersection – Zone B, Level 0', zone: 'B', level: 0, facing: 'N', mounting: 'South-east corner of the compass intersection, facing north (toward Zone C).', kind: 'junction', status: 'DERIVED' },
  { id: 'COMPASS_LEVEL_1', node: 'COMPASS_1', name: 'Compass intersection – Zone B, Level 1', zone: 'B', level: 1, facing: 'N', mounting: 'South-east corner of the compass intersection, facing north (toward Zone C).', kind: 'junction', status: 'DERIVED' },
  ...([-1, 0, 1, 2, 3, 4] as Level[]).filter((l) => l >= 0).map((l) => lift('A', l)),
  { id: 'ZONE_A_LIFT_LEVEL_T', node: 'A_EL_T', name: 'Zone A elevator lobby – tunnel (Level B / “T”)', zone: 'A', level: -1, facing: 'S', mounting: 'At the tunnel end, facing the Zone A elevator doors.', kind: 'lift', status: 'DERIVED' },
  ...([0, 1, 2, 3, 4, 5, 6] as Level[]).map((l) => lift('B', l)),
  ...([0, 1] as Level[]).map((l) => lift('C', l)),
  ...([0, 1, 2, 3] as Level[]).map((l) => lift('D', l)),
  { id: 'TRAINING_ANNEX_DOOR', node: 'X_DOOR', name: 'TRAINING ONLY – fictional annex door', zone: 'X', level: 0, mounting: 'Fictional. Used to prove that scanning a QR code never grants access.', kind: 'training', status: 'FICTIONAL' },
];

export const CHECKPOINT_BY_ID: Record<string, Checkpoint> = Object.fromEntries(CHECKPOINTS.map((c) => [c.id, c]));

export type CheckpointParse =
  | { ok: true; checkpoint: Checkpoint }
  | { ok: false; reason: 'missing' | 'malformed' | 'unknown'; raw: string };

/** Never trust a checkpoint string blindly: validate format, then look it up. */
export function parseCheckpoint(raw: string | null | undefined): CheckpointParse {
  if (raw == null || raw === '') return { ok: false, reason: 'missing', raw: '' };
  const v = raw.trim().toUpperCase();
  if (!/^[A-Z0-9_]{2,40}$/.test(v)) return { ok: false, reason: 'malformed', raw: raw.slice(0, 60) };
  const c = CHECKPOINT_BY_ID[v];
  if (!c || !NODE_BY_ID[c.node]) return { ok: false, reason: 'unknown', raw: v };
  return { ok: true, checkpoint: c };
}

export function checkpointUrl(base: string, id: string): string {
  const u = new URL(base);
  u.search = '';
  u.hash = '';
  u.searchParams.set('checkpoint', id);
  return u.toString();
}
