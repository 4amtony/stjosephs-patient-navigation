import type { Level, Provenance, ZoneId } from './types';

/**
 * Zone footprints traced by eye from the official July 2019 site map (SITEMAP source).
 * Coordinates are pixels in a 1688×2184 frame of that map, north up. SCHEMATIC: shapes are
 * simplified; relative position and adjacency are the meaningful part, not size or distance.
 * Level ranges are the levels for which official room numbers / directions exist.
 */
export interface ZoneDef {
  id: ZoneId;
  /** official colour name used in signage text ("Zone A (green)") */
  colourName: 'green' | 'red' | 'blue' | 'gold' | 'purple' | 'darkGreen' | 'grey' | 'hatched';
  hex: string;
  polygon: [number, number][];
  levels: Level[];
  levelEvidence: string;
  status: Provenance;
  label: string;
}

export const ZONES: ZoneDef[] = [
  {
    id: 'A', colourName: 'green', hex: '#6f8f3a', label: 'Zone A',
    polygon: [[250, 1285], [340, 1285], [340, 1425], [805, 1425], [805, 1555], [600, 1555], [600, 1612], [420, 1612], [420, 1635], [250, 1635]],
    levels: [0, 1, 2, 3, 4], levelEvidence: 'Rooms A0-012 … A4-003; Zone A elevators also stop at Level B (tunnel).', status: 'SCHEMATIC',
  },
  {
    id: 'B', colourName: 'red', hex: '#a83636', label: 'Zone B',
    polygon: [[885, 1045], [1385, 1045], [1385, 1772], [860, 1772], [860, 1530], [805, 1530], [805, 1425], [885, 1425]],
    levels: [0, 1, 2, 3, 4, 5, 6], levelEvidence: 'Rooms B0-068 … B6-665.', status: 'SCHEMATIC',
  },
  {
    id: 'C', colourName: 'blue', hex: '#456f92', label: 'Zone C',
    polygon: [[660, 555], [865, 555], [865, 415], [1145, 415], [1145, 1045], [945, 1045], [945, 860], [660, 860]],
    levels: [0, 1], levelEvidence: 'Rooms C0-102, C0-107, C0-200, C1-102, C1-300.', status: 'SCHEMATIC',
  },
  {
    id: 'D', colourName: 'gold', hex: '#c48d3f', label: 'Zone D',
    polygon: [[375, 255], [650, 255], [650, 555], [660, 555], [660, 855], [480, 855], [480, 930], [290, 930], [290, 855], [330, 855], [330, 590], [375, 590]],
    levels: [0, 1, 2, 3], levelEvidence: 'Rooms D0-101 … D3-101.', status: 'SCHEMATIC',
  },
  {
    id: 'E', colourName: 'purple', hex: '#6b2a6e', label: 'Zone E',
    polygon: [[250, 1050], [522, 1050], [522, 1285], [250, 1285]],
    levels: [1], levelEvidence: 'Only E1 rooms are publicly listed (meeting rooms, Livingston Lounge).', status: 'SCHEMATIC',
  },
  {
    id: 'F', colourName: 'darkGreen', hex: '#1f4b35', label: 'Zone F',
    polygon: [[575, 1048], [835, 1048], [835, 1132], [575, 1132]],
    levels: [1], levelEvidence: 'Shown on site map; no public destinations or directions found.', status: 'UNVERIFIED',
  },
];

export const GARAGES_GEOM = [
  {
    id: 'GG' as const, label: 'Grosvenor Parking Garage', hex: '#7c8794',
    polygon: [[225, 2015], [1475, 2015], [1475, 2135], [225, 2135]] as [number, number][],
    levels: [-1, 0, 1, 2, 3] as Level[], status: 'SCHEMATIC' as Provenance,
    note: 'Across Grosvenor Street from Entrance 1. Number of decks not published here — drawn schematically.',
  },
  {
    id: 'CG' as const, label: 'Cheapside Parking (underground)', hex: '#7c8794',
    polygon: [[868, 290], [1145, 290], [1145, 410], [868, 410]] as [number, number][],
    levels: [-1] as Level[], status: 'SCHEMATIC' as Provenance,
    note: 'Underground garage reached from the Cheapside Street driveway; connects to Zone C elevators.',
  },
];

/** Streets as simple bands (map frame px). Names from site map; positions schematic. */
export const STREETS = [
  { name: 'Grosvenor Street', from: [60, 1925] as [number, number], to: [1640, 1925] as [number, number], width: 70 },
  { name: 'Cheapside Street', from: [60, 115] as [number, number], to: [1640, 115] as [number, number], width: 70 },
  { name: 'Richmond Street', from: [120, 60] as [number, number], to: [120, 2180] as [number, number], width: 70 },
  { name: 'Wellington Street', from: [1565, 60] as [number, number], to: [1565, 2180] as [number, number], width: 70 },
];

/** Fictional training annex used ONLY by the security demo. Deliberately floating off-site. */
export const FICTIONAL_ANNEX = {
  id: 'X' as const,
  label: 'FICTIONAL TRAINING ANNEX',
  polygon: [[1440, 1180], [1640, 1180], [1640, 1330], [1440, 1330]] as [number, number][],
  level: 0 as Level,
};

export function zoneById(id: ZoneId): ZoneDef | undefined {
  return ZONES.find((z) => z.id === id);
}

export const ZONE_COLOURS: Record<string, string> = {
  A: '#6f8f3a', B: '#a83636', C: '#456f92', D: '#c48d3f', E: '#6b2a6e', F: '#1f4b35', GG: '#7c8794', CG: '#7c8794', OUT: '#8a8a8a', X: '#8b5cf6',
};
