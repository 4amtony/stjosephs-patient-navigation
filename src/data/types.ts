/**
 * Shared types for the St. Joseph's navigation data model.
 *
 * Provenance vocabulary (see docs/SOURCE_MAP.md):
 *  - OFFICIAL     explicitly shown/described in an official St. Joseph's map or directions page
 *  - DERIVED      inferred by combining documented connections (evidence + uncertainty recorded)
 *  - SCHEMATIC    approximate geometry created only to visualise the model (not to scale)
 *  - UNVERIFIED   mentioned but not locatable/confirmable from public sources
 *  - CONFLICTING  official sources disagree
 *  - FICTIONAL    invented for the access-control training demo; not a real place
 */
export type Provenance = 'OFFICIAL' | 'DERIVED' | 'SCHEMATIC' | 'UNVERIFIED' | 'CONFLICTING' | 'FICTIONAL';

export type ZoneId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'GG' | 'CG' | 'OUT' | 'X';
/** Hospital level. -1 = Level B / tunnel (and Cheapside underground garage). */
export type Level = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Cardinal = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
export type Turn = 'left' | 'right' | 'straight' | 'back';
export type Side = 'left' | 'right' | 'ahead' | 'behind';
export type StepFree = 'yes' | 'unknown' | 'no';

export interface Evidence {
  /** id in SOURCES */
  src: string;
  /** short supporting quote or description */
  quote?: string;
}

export type LandmarkKey =
  | 'compass'
  | 'infoDesk'
  | 'volunteerDesk'
  | 'lobby'
  | 'elevators'
  | 'corridorEnd'
  | 'stairsOpening'
  | 'timHortons'
  | 'aquarium'
  | 'column'
  | 'walkway'
  | 'museumCases'
  | 'tunnel'
  | 'garageElevator'
  | 'entrance'
  | 'street'
  | 'junction'
  | 'doubleDoors'
  | 'trainingDoor'
  | 'walkway';

export type NodeKind =
  | 'entrance'
  | 'junction'
  | 'elevator'
  | 'destination'
  | 'garage'
  | 'outdoor'
  | 'restricted';

export type BankId = 'A' | 'B' | 'C' | 'D' | 'GG';

export interface GNode {
  id: string;
  level: Level;
  /** schematic coordinates in pixels of the official 2019 site map (north up, 1688×2184 frame) */
  x: number;
  y: number;
  zone: ZoneId;
  kind: NodeKind;
  /** official English name / sign text if the node is a named place */
  label?: string;
  lm?: LandmarkKey;
  /** for destinations: which side of the corridor the door/desk is on (absolute direction) */
  door?: Cardinal;
  /** elevator bank membership */
  bank?: BankId;
  /** heading on entering the building here (entrances) */
  inHeading?: Cardinal;
  status: Provenance;
}

export type EdgeKind = 'walk' | 'elevator' | 'stairs' | 'tunnel' | 'outdoor' | 'restricted';

export interface GEdge {
  id: string;
  a: string;
  b: string;
  kind: EdgeKind;
  status: Provenance;
  ev: Evidence[];
  stepFree: StepFree;
  door?: 'sliding' | 'closed' | 'double' | 'open';
  /** a landmark you pass on this edge */
  pass?: LandmarkKey;
  /**
   * Override headings when geometry is too schematic to infer them. A single cardinal means
   * depart and arrive in that direction; a tuple is [departHeading, arriveHeading] (curved corridor).
   * Reverse traversal uses the opposite of headAB unless headBA is given.
   */
  headAB?: Cardinal | [Cardinal, Cardinal];
  headBA?: Cardinal | [Cardinal, Cardinal];
  /** only traversable a→b */
  oneway?: boolean;
  /** relative cost multiplier (e.g. outdoor street crossing) */
  costMul?: number;
  note?: string;
}
