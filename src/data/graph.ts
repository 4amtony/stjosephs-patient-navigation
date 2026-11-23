/**
 * Navigation topology for St. Joseph's Hospital (268 Grosvenor St, London ON).
 *
 * How this was built (see docs/DATA_COVERAGE.md):
 *  1. Zone layout, entrances, elevator icons, compass rose, tunnel and garages were traced from the
 *     official July 2019 site map (SITEMAP).
 *  2. Every corridor/elevator edge below is backed by at least one phrase in the official
 *     turn-by-turn directions (DIRECTIONS), cited in `ev`.
 *  3. Node coordinates are SCHEMATIC. They were placed so that the turn words in the official text
 *     ("turn left at the compass intersection", "from the elevator lobby, turn right", "… is on the
 *     right") are reproduced by the heading model in src/engine/steps.ts. tests/officialAlignment
 *     checks this for the demo routes.
 *  4. Elevator exit headings are DERIVED from consistent official text across many floors:
 *     Zone A exits face south, Zones B and D face north, Zone C faces west.
 *
 * Nothing here is a floor plan. Distances are not real.
 */
import type { BankId, Cardinal, Evidence, GEdge, GNode, Level, NodeKind, Provenance, ZoneId } from './types';

export const NODES: GNode[] = [];
export const EDGES: GEdge[] = [];

function node(id: string, level: Level, x: number, y: number, zone: ZoneId, kind: NodeKind, o: Partial<GNode> = {}) {
  NODES.push({ id, level, x, y, zone, kind, status: 'SCHEMATIC', ...o });
}
let eid = 0;
function edge(a: string, b: string, kind: GEdge['kind'], status: Provenance, ev: Evidence[], o: Partial<GEdge> = {}) {
  EDGES.push({ id: `e${++eid}`, a, b, kind, status, ev, stepFree: kind === 'elevator' ? 'yes' : 'unknown', ...o });
}
const walk = (a: string, b: string, ev: Evidence[], o: Partial<GEdge> = {}) => edge(a, b, 'walk', 'OFFICIAL', ev, o);
const D = (quote: string): Evidence => ({ src: 'DIRECTIONS', quote });
const M = (quote: string): Evidence => ({ src: 'SITEMAP', quote });

/* Elevator banks: exit heading (direction you face stepping out) + levels served. */
/**
 * `approach: 'side'` = official text describes reaching this bank as "elevators on your
 * right/left" rather than a turn (Zone A: "Watch for the elevators on your right"; Zone C:
 * "Elevators will be on your left").
 */
export const BANKS: Record<BankId, { label: string; exit: Cardinal; levels: Level[]; x: number; y: number; status: Provenance; evidence: string; approach?: 'side' }> = {
  A: { label: 'Zone A elevators', exit: 'S', approach: 'side', levels: [-1, 0, 1, 2, 3, 4], x: 740, y: 1445, status: 'DERIVED', evidence: '“Take one of the Zone "A" elevators (to the right of the information desk)”; tunnel: push "T" in the elevator.' },
  B: { label: 'Zone B elevators', exit: 'N', levels: [0, 1, 2, 3, 4, 5, 6], x: 1245, y: 1515, status: 'DERIVED', evidence: '“Proceed down the corridor, to the bank of elevators on either side.”' },
  C: { label: 'Zone C elevators', exit: 'W', approach: 'side', levels: [-1, 0, 1], x: 843, y: 620, status: 'DERIVED', evidence: '“Elevators will be on your left. Take one of the Zone "C" elevators”; garage elevator connects to Level 0 and Level 1.' },
  D: { label: 'Zone D elevators', exit: 'N', levels: [0, 1, 2, 3], x: 565, y: 605, status: 'DERIVED', evidence: '“Take one of the Zone D elevators to Level 1 (D1).”' },
  GG: { label: 'Grosvenor garage elevators (north-west corner)', exit: 'N', levels: [-1, 1], x: 270, y: 2050, status: 'OFFICIAL', evidence: '“Take the Elevator located in the North West corner of the Grosvenor parking garage to Level B (tunnel).”' },
};

/* ---------------- Level -1 : tunnel + Cheapside underground garage ---------------- */
node('GG_EL_T', -1, 270, 2050, 'GG', 'elevator', { bank: 'GG', lm: 'garageElevator', label: 'Grosvenor garage elevators – Level B (tunnel)', status: 'OFFICIAL' });
node('A_EL_T', -1, 740, 1445, 'A', 'elevator', { bank: 'A', lm: 'elevators', label: 'Zone A elevators – tunnel level', status: 'DERIVED' });
node('CS_PARK', -1, 1000, 350, 'CG', 'garage', { label: 'Cheapside Street parking garage (underground)', status: 'OFFICIAL' });
node('C_EL_G', -1, 843, 620, 'C', 'elevator', { bank: 'C', lm: 'elevators', label: 'Zone C elevators – garage level', status: 'DERIVED' });

/* ---------------- Level 0 ---------------- */
node('E2_OUT', 0, 1245, 1880, 'OUT', 'outdoor', { label: 'Grosvenor Entrance 2 drop-off', lm: 'entrance', status: 'OFFICIAL' });
node('E2', 0, 1245, 1790, 'B', 'entrance', { label: 'Grosvenor Entrance 2', inHeading: 'N', status: 'OFFICIAL' });
node('E2_DESK', 0, 1245, 1725, 'B', 'junction', { lm: 'aquarium', status: 'SCHEMATIC' });
node('INFO_E2', 0, 1275, 1745, 'B', 'destination', { door: 'E', label: 'Information Desk – Entrance 2', status: 'OFFICIAL' });
node('GASTRO', 0, 1150, 1725, 'B', 'destination', { door: 'W', label: 'Gastroenterology / Endoscopy' });
node('URGENT', 0, 1245, 1620, 'B', 'destination', { door: 'E', label: 'Urgent Care' });
node('B_EL_0', 0, 1245, 1515, 'B', 'elevator', { bank: 'B', lm: 'elevators' });
node('BJ_0', 0, 1245, 1470, 'B', 'junction', { lm: 'column' });
node('B0_N', 0, 1235, 1400, 'B', 'junction');
node('LAB', 0, 1236, 1370, 'B', 'destination', { door: 'E', label: 'Lab Test' });
node('SECURITY', 0, 1234, 1372, 'B', 'destination', { door: 'W', label: 'Security Services' });
node('BE_0', 0, 1365, 1470, 'B', 'junction', { lm: 'corridorEnd' });
node('SADV', 0, 1365, 1365, 'B', 'destination', { door: 'N', label: 'Sexual Assault and Domestic Violence Treatment' });
node('E3', 0, 1430, 1365, 'B', 'entrance', { label: 'Wellington Entrance 3 (at the ramp)', inHeading: 'W', status: 'OFFICIAL' });
node('E3_OUT', 0, 1500, 1365, 'OUT', 'outdoor', { label: 'Wellington Street', lm: 'street' });
node('BUSINESS', 0, 1000, 1470, 'B', 'destination', { door: 'N', label: 'Business Office' });
node('COMPASS_0', 0, 955, 1470, 'B', 'junction', { lm: 'compass', status: 'OFFICIAL' });
node('CAFE', 0, 955, 1585, 'B', 'destination', { door: 'S', label: 'Café 268' });
node('AB_0', 0, 800, 1470, 'A', 'junction');
node('A0_J', 0, 740, 1470, 'A', 'junction');
node('A_EL_0', 0, 740, 1445, 'A', 'elevator', { bank: 'A', lm: 'elevators' });
node('GUEST', 0, 600, 1470, 'A', 'destination', { door: 'N', label: 'Guest House Accommodations' });
node('BC_0', 0, 950, 1045, 'C', 'junction');
node('TIMS', 0, 875, 800, 'C', 'destination', { door: 'E', lm: 'timHortons', label: 'On the Go / Tim Hortons' });
node('MI_C0', 0, 850, 700, 'C', 'destination', { door: 'E', label: 'Medical Imaging – C0' });
node('C0_LOBBY', 0, 740, 620, 'C', 'junction', { lm: 'lobby' });
node('INFO_E4', 0, 760, 590, 'C', 'destination', { door: 'E', label: 'Information / Volunteer Desk – Entrance 4 (Zone C lobby)', status: 'OFFICIAL' });
node('E4', 0, 740, 545, 'C', 'entrance', { label: 'Cheapside Entrance 4', inHeading: 'S', status: 'OFFICIAL' });
node('E4_OUT', 0, 740, 470, 'OUT', 'outdoor', { label: 'Cheapside Entrance 4 drop-off', lm: 'entrance', status: 'OFFICIAL' });
node('C_EL_0', 0, 843, 620, 'C', 'elevator', { bank: 'C', lm: 'elevators' });
node('GIFT', 0, 843, 575, 'C', 'destination', { door: 'N', label: 'Gift Shop' });
node('CD_0', 0, 662, 630, 'D', 'junction', { lm: 'stairsOpening' });
node('D_EL_0', 0, 565, 615, 'D', 'elevator', { bank: 'D', lm: 'elevators' });
node('HULC', 0, 500, 615, 'D', 'destination', { door: 'S', label: 'Roth McFarlane Hand and Upper Limb Centre (HULC)' });
node('SHUTTLE', 0, 662, 700, 'D', 'destination', { door: 'W', label: 'Shuttleworth Auditorium', status: 'CONFLICTING' });

/* ---------------- Level 1 ---------------- */
node('GG_EL_P', 1, 270, 2050, 'GG', 'garage', { bank: 'GG', lm: 'garageElevator', label: 'Grosvenor Parking Garage – north-west elevator lobby', status: 'OFFICIAL', inHeading: 'N' });
node('GG_STREET', 1, 270, 1985, 'OUT', 'outdoor', { label: 'Grosvenor Street (garage street-level exit)', lm: 'street', status: 'DERIVED' });
node('E1_OUT', 1, 668, 1700, 'OUT', 'outdoor', { label: 'Grosvenor Entrance 1 drop-off', lm: 'entrance', status: 'OFFICIAL' });
node('E1', 1, 668, 1595, 'A', 'entrance', { label: 'Grosvenor Entrance 1 (main entrance)', inHeading: 'N', status: 'OFFICIAL' });
node('A1_LOBBY', 1, 690, 1490, 'A', 'junction', { lm: 'lobby' });
node('INFO_E1', 1, 705, 1468, 'A', 'destination', { door: 'N', label: 'Information Desk – Zone A lobby (Entrance 1)', status: 'OFFICIAL' });
node('A_EL_1', 1, 740, 1445, 'A', 'elevator', { bank: 'A', lm: 'elevators' });
node('RX', 1, 545, 1490, 'A', 'destination', { door: 'N', label: 'Prescription Shop' });
node('FOUND', 1, 430, 1490, 'A', 'destination', { door: 'S', label: 'Foundation' });
node('A1_WEND', 1, 320, 1490, 'A', 'junction', { lm: 'corridorEnd' });
node('AE_1', 1, 300, 1290, 'E', 'junction', { lm: 'museumCases' });
node('E1_ROOMS', 1, 420, 1110, 'E', 'destination', { door: 'N', label: 'Meeting Rooms 1–3 and Lawson Board Room (Zone E)', status: 'DERIVED' });
node('AB_1', 1, 805, 1470, 'B', 'junction');
node('MULTI', 1, 845, 1470, 'B', 'destination', { door: 'S', label: 'Multifaith Prayer Room' });
node('SPIRIT', 1, 885, 1470, 'B', 'destination', { door: 'S', label: 'Spiritual Care' });
node('COMPASS_1', 1, 955, 1470, 'B', 'junction', { lm: 'compass', status: 'OFFICIAL' });
node('IVEY', 1, 1120, 1470, 'B', 'destination', { door: 'S', label: 'Ivey Eye Institute' });
node('BJ_1', 1, 1245, 1470, 'B', 'junction');
node('B_EL_1', 1, 1245, 1515, 'B', 'elevator', { bank: 'B', lm: 'elevators' });
node('BC_1', 1, 950, 1045, 'C', 'junction');
node('SURG', 1, 945, 975, 'C', 'destination', { door: 'E', label: 'Surgical Centre (Registration)' });
node('C_END_1', 1, 790, 760, 'C', 'junction', { lm: 'corridorEnd' });
node('CD_1', 1, 662, 790, 'D', 'junction');
node('D1_SW', 1, 500, 790, 'D', 'junction', { lm: 'corridorEnd' });
node('BREAST', 1, 500, 700, 'D', 'destination', { door: 'W', label: 'Breast Care Centre' });
node('WSIB', 1, 500, 650, 'D', 'destination', { door: 'W', label: 'WSIB Specialty Clinic', status: 'CONFLICTING' });
node('D1_NW', 1, 500, 605, 'D', 'junction', { lm: 'corridorEnd' });
node('D_EL_1', 1, 565, 605, 'D', 'elevator', { bank: 'D', lm: 'elevators' });
node('C_EL_1', 1, 843, 620, 'C', 'elevator', { bank: 'C', lm: 'elevators' });
node('FAMILY', 1, 843, 560, 'C', 'destination', { door: 'N', label: 'Family Waiting Room (Surgery)' });
node('C1_STAIRS', 1, 760, 620, 'C', 'junction', { lm: 'walkway' });
node('C1_WALK', 1, 760, 975, 'C', 'junction', { lm: 'doubleDoors' });

/* ---------------- Zone B upper floors (levels 2–6) ---------------- */
for (const L of [2, 3, 4, 5, 6] as Level[]) {
  node(`B_EL_${L}`, L, 1245, 1515, 'B', 'elevator', { bank: 'B', lm: 'elevators' });
  node(`BJ_${L}`, L, 1245, 1470, 'B', 'junction');
}
for (const L of [2, 4, 5] as Level[]) node(`COMPASS_${L}`, L, 955, 1470, 'B', 'junction', { lm: 'compass', status: 'OFFICIAL' });
node('BE_2', 2, 1365, 1470, 'B', 'junction', { lm: 'corridorEnd' });
node('CATARACT', 2, 1355, 1470, 'B', 'destination', { door: 'N', label: 'Cataract' });
node('HEADNECK', 2, 1358, 1470, 'B', 'destination', { door: 'S', label: 'Head and Neck' });
node('THOMPSON', 2, 1100, 1470, 'B', 'destination', { door: 'S', label: 'Thompson Amphitheatre' });
node('B2_HIM_J', 2, 955, 1330, 'B', 'junction');
node('HIM', 2, 1030, 1330, 'B', 'destination', { door: 'E', label: 'Health Information Management' });
node('B3030', 3, 1170, 1470, 'B', 'destination', { door: 'N', label: 'B3 Outpatient Clinics – Central Registration' });
node('THYROID', 4, 1185, 1470, 'B', 'destination', { door: 'N', label: 'Thyroid Cancer, Osteoporosis and Endocrinology' });
node('VOLUNTEER', 4, 900, 1470, 'B', 'destination', { door: 'N', label: 'Volunteer Services (office)' });
node('COLPO', 4, 1300, 1470, 'B', 'destination', { door: 'S', label: 'Colposcopy' });
node('UROLOGY', 4, 1365, 1470, 'B', 'destination', { door: 'N', label: 'Urology' });
node('PHYSIO', 4, 955, 1545, 'B', 'destination', { door: 'W', label: 'Physiotherapy (HULC)' });
node('AB_4', 4, 805, 1470, 'B', 'junction');
node('DIABETES', 5, 1300, 1470, 'B', 'destination', { door: 'S', label: 'Diabetes and Endocrinology' });
node('MI_B5', 5, 955, 1380, 'B', 'destination', { door: 'E', label: 'Medical Imaging – B5 (MRI, Molecular Imaging and Theranostics)' });
node('INPATIENT', 6, 1300, 1470, 'B', 'destination', { door: 'S', label: 'Inpatient Surgical' });
node('BE_6', 6, 1365, 1470, 'B', 'junction', { lm: 'corridorEnd' });
node('B6_NE', 6, 1365, 1330, 'B', 'junction', { lm: 'corridorEnd' });
node('ANESTH', 6, 1290, 1330, 'B', 'destination', { door: 'W', label: 'Anesthesia' });

/* ---------------- Zone A upper floors ---------------- */
for (const L of [2, 3, 4] as Level[]) {
  node(`A_EL_${L}`, L, 740, 1445, 'A', 'elevator', { bank: 'A', lm: 'elevators' });
}
node('A2_J', 2, 740, 1470, 'A', 'junction');
node('MEDAFF', 2, 610, 1470, 'A', 'destination', { door: 'N', label: 'Medical Affairs' });
node('ADAMS', 2, 480, 1470, 'A', 'destination', { door: 'S', label: 'Adams Executive Boardroom' });
node('A2_WEND', 2, 330, 1470, 'A', 'junction', { lm: 'corridorEnd' });
node('CHAPEL', 2, 330, 1390, 'A', 'destination', { door: 'N', label: 'Chapel' });
node('A2039', 2, 330, 1540, 'A', 'destination', { door: 'W', label: 'Meeting Room A2-039' });
node('HR', 3, 740, 1470, 'A', 'destination', { door: 'S', label: 'Human Resources' });
node('A4_J', 4, 740, 1470, 'A', 'junction');
node('CLINTRIALS', 4, 740, 1485, 'A', 'destination', { door: 'S', label: 'Clinical Trials' });

/* ---------------- Zone D upper floors ---------------- */
for (const L of [2, 3] as Level[]) node(`D_EL_${L}`, L, 565, 605, 'D', 'elevator', { bank: 'D', lm: 'elevators' });
node('D2_NW', 2, 500, 605, 'D', 'junction', { lm: 'corridorEnd' });
node('RHEUM', 2, 500, 665, 'D', 'destination', { door: 'S', label: 'Rheumatology Centre' });
node('OTPT', 3, 565, 575, 'D', 'destination', { door: 'W', label: 'Occupational Therapy / Physiotherapy' });

/* ---------------- FICTIONAL training annex (security demo only) ---------------- */
node('X_DOOR', 0, 1450, 1255, 'X', 'restricted', { lm: 'trainingDoor', label: 'TRAINING ONLY – staff-verified door (fictional)', status: 'FICTIONAL' });
node('X_LAB', 0, 1580, 1255, 'X', 'destination', { door: 'E', label: 'Simulation Training Lab X-101 (FICTIONAL)', status: 'FICTIONAL' });

/* ================================ EDGES ================================ */

/* Grosvenor garage → tunnel → Zone A elevators (OFFICIAL: "safest and most accessible route") */
edge('GG_EL_T', 'A_EL_T', 'tunnel', 'OFFICIAL', [
  D('Exit the elevator. Turn right and proceed to the end of the corridor. Take one of the Zone "A" elevators'),
  { src: 'PARKING', quote: 'the safest and most accessible route is through the tunnel' },
], { headAB: ['E', 'N'], stepFree: 'yes', note: 'tunnel' });
/* Garage street level → Grosvenor St → Entrances 1 / 2 (DERIVED outdoor legs) */
edge('GG_EL_P', 'GG_STREET', 'walk', 'OFFICIAL', [{ src: 'PARKING', quote: 'elevator that will take you to the wheelchair-accessible ramp on street level (level 1)' }], { stepFree: 'yes' });
edge('GG_STREET', 'E1_OUT', 'outdoor', 'DERIVED', [{ src: 'PARKING', quote: 'garage entrance is located on Grosvenor Street, across the street from Grosvenor Entrance 1' }], { costMul: 1.4 });
edge('GG_STREET', 'E2_OUT', 'outdoor', 'DERIVED', [M('Grosvenor Parking Garage and Entrance 2 both front Grosvenor Street')], { costMul: 1.4 });

/* Entrances */
walk('E1_OUT', 'E1', [{ src: 'PARKING', quote: 'Drop off areas are available at Entrance 1 and 2 on Grosvenor Street and Entrance 4 on Cheapside Street' }]);
walk('E2_OUT', 'E2', [{ src: 'DIRECTORY', quote: 'Paratransit drops patients off at Grosvenor Entrance 2' }]);
walk('E4_OUT', 'E4', [{ src: 'PARKING', quote: 'Entrance 4 on Cheapside Street' }]);
walk('E3_OUT', 'E3', [D('Enter the hospital through Wellington Entrance 3 (at the ramp).')], { status: 'OFFICIAL', note: 'ramp' });

/* ---- Zone A, Level 1 ---- */
walk('E1', 'A1_LOBBY', [D('Proceed through the sliding doors into Zone A lobby.')], { door: 'sliding' });
walk('A1_LOBBY', 'INFO_E1', [D('Zone "A" elevators (to the right of the information desk)')]);
walk('A1_LOBBY', 'A_EL_1', [D('Take one of the Zone "A" elevators (to the right of the information desk)')], { headAB: 'N' });
walk('A1_LOBBY', 'RX', [D('Continue to the left of the lobby. The Prescription Shop (A1-013) is in the corner to the right.')]);
walk('RX', 'FOUND', [D('Turn left. Proceed down the corridor. Foundation (A1-015) is on the left.')]);
walk('FOUND', 'A1_WEND', [{ src: 'DIRECTIONS', quote: 'From the Zone A lobby turn left and proceed to the end of this corridor.' }]);
walk('A1_WEND', 'AE_1', [D('Turn right and pass the museum display cases… Travel from Zone A (green) into Zone E (purple).')], { status: 'DERIVED', pass: 'museumCases' });
walk('AE_1', 'E1_ROOMS', [D('Meeting Rooms 1 (E1-126), 2 (E1-128) and 3 (E1-134), and the Lawson Board Room (E1-122) are here.')], { status: 'DERIVED' });
walk('A1_LOBBY', 'AB_1', [D('Turn right. Travel from Zone A (green) into Zone B (red).')]);
walk('AB_1', 'MULTI', [D('The Multifaith Prayer Room (B1-039) is the first door on the right.')]);
walk('MULTI', 'SPIRIT', [D('Spiritual Care (B1-041) is the second door on the right.')]);
walk('SPIRIT', 'COMPASS_1', [D('Proceed down the corridor. Past the compass intersection.')]);
walk('COMPASS_1', 'IVEY', [D('Continue down this corridor to enter the Ivey Eye Institute. The registration area is on the right.')]);
walk('IVEY', 'BJ_1', [D('Turn right at the next corridor and take one of the Zone "B" elevators')]);
walk('BJ_1', 'B_EL_1', [D('Turn right at the next corridor and take one of the Zone "B" elevators')]);
walk('COMPASS_1', 'BC_1', [D('Turn left at the compass intersection. Follow this corridor to the end. Travel from Zone B (red) into Zone C (blue).')], { costMul: 1.2 });
walk('BC_1', 'SURG', [D('Continue down this corridor to Zone C. The Surgical Centre entrance is highlighted with a blue wall.')], { costMul: 1.2 });
walk('SURG', 'C_END_1', [D('Follow this corridor to the end.')], { headAB: ['N', 'NW'], costMul: 1.2 });
walk('C_END_1', 'C_EL_1', [D('At the end of the corridor turn right. Follow this corridor to the end and take one of the Zone "C" elevators')], { headAB: 'N' });
walk('C_EL_1', 'C1_STAIRS', [D('Exit the elevator. Proceed straight ahead towards the stairs.')]);
walk('C1_STAIRS', 'C1_WALK', [D('Enter the open double doors to your left, and take the walkway.')], { door: 'double', status: 'DERIVED' });
walk('C1_WALK', 'SURG', [D('After the next set of double doors turn left. The Surgical Centre entrance is highlighted with a blue wall.')], { door: 'double', status: 'DERIVED' });
walk('C_EL_1', 'FAMILY', [D('Turn right. Family Waiting Room - Surgery (C1-102) is straight ahead.')], { status: 'DERIVED', note: 'Exit-side of C1 elevator not fully consistent across official texts.' });
walk('C_END_1', 'CD_1', [D('At the end of the corridor turn left. Travel from Zone C (blue) into Zone D (gold).')], { headAB: 'W' });
walk('CD_1', 'D1_SW', [D('Follow this corridor to the end.')]);
walk('D1_SW', 'BREAST', [D('Turn right. The Breast Care (D1-112) is on the left (beside the pink column).')]);
walk('BREAST', 'WSIB', [D('WSIB (D1-173) is on the left (past the Breast Care Clinic).')]);
walk('WSIB', 'D1_NW', [D('Turn right follow this corridor to the end.')]);
walk('D1_NW', 'D_EL_1', [D('Turn right and take one of the Zone "D" elevators')]);

/* ---- Level 0 spine (A0 ↔ B0 ↔ compass ↔ C0 lobby) ---- */
walk('A_EL_0', 'A0_J', [D('Exit the elevator.')], { headAB: 'S' });
walk('A0_J', 'GUEST', [D('Turn right. Proceed down the corridor. Guest House Accommodations (A0-012) is on the right.')]);
walk('A0_J', 'AB_0', [D('Turn left. Proceed down the corridor to Zone B.')], { costMul: 2.0 });
walk('AB_0', 'COMPASS_0', [D('Travel from Zone B (red) into Zone A (green). Watch for the elevators on your right.')]);
walk('COMPASS_0', 'CAFE', [D('Turn left at the compass intersection. Café 268 is at the end of the corridor.')]);
walk('COMPASS_0', 'BUSINESS', [D('The Business Office (B0-068) is on the right (just before the compass intersection).')]);
walk('BUSINESS', 'BJ_0', [D('Proceed towards the column and turn left. Continue down this corridor.')]);
walk('BJ_0', 'B_EL_0', [D('Proceed down the corridor, past the Zone B elevators.')]);
walk('B_EL_0', 'URGENT', [D('The Urgent Care (B0-504) entrance is straight ahead, on the right side of the corridor')]);
walk('URGENT', 'E2_DESK', [D('Proceed towards Grosvenor Entrance 2.')]);
walk('E2_DESK', 'E2', [D('Enter the hospital through Grosvenor Entrance 2 – Zone B.')]);
walk('E2_DESK', 'INFO_E2', [D('Turn left just past the information desk')]);
walk('E2_DESK', 'GASTRO', [D('Turn right at the intersection (aquarium on the right). The Gastroenterology/ Endoscopy (B0-323) is straight ahead.')]);
walk('BJ_0', 'B0_N', [D('Continue through the intersection slightly to the left.')]);
walk('B0_N', 'LAB', [D('The Lab Test (B0-634) is the first door on the right.')]);
walk('B0_N', 'SECURITY', [D('Security Services (B0‐401) is the first door on the left.')]);
walk('BJ_0', 'BE_0', [D('Turn right. Proceed to the end of this corridor and turn left.')]);
walk('BE_0', 'SADV', [D('Sexual Assault and Domestic Violence (B0-644) is straight ahead.')]);
walk('E3', 'SADV', [D('Proceed through the sliding doors. Sexual Assault and Domestic Violence (B0-644) is on your right.')], { door: 'sliding' });
walk('COMPASS_0', 'BC_0', [D('Proceed down the corridor. Travel from Zone C (blue) into Zone B (red).')]);
walk('BC_0', 'TIMS', [D('Take the corridor to the left of “On the Go/Tim Hortons”.')], { headAB: 'N' });
walk('TIMS', 'C0_LOBBY', [D('Proceed through the Zone C lobby to the left.')], { headAB: ['N', 'NW'] });
walk('C0_LOBBY', 'MI_C0', [D('Medical Imaging (C0-200) registration is on the left side of the lobby, just past the Zone C elevators.')], { headAB: 'S', pass: 'elevators' });
walk('TIMS', 'MI_C0', [D('Proceed towards the Zone C lobby. Medical Imaging (C0-200) is on the right.')], { headAB: 'N' });
walk('E4', 'C0_LOBBY', [D('Enter the hospital through Cheapside Entrance 4 – Zone C.')]);
walk('C0_LOBBY', 'INFO_E4', [D('The Gift Shop (C0-102) is around the corner, behind the information desk.')]);
walk('C0_LOBBY', 'C_EL_0', [D('Elevators will be on your left.')], { headAB: 'E' });
walk('C_EL_0', 'MI_C0', [D('Exit the elevator. Turn left. Medical Imaging (C0-200) is just around the corner.')], { headAB: 'S', status: 'DERIVED' });
walk('C_EL_0', 'GIFT', [D('Exit the elevator. The Gift Shop (C0-102) is on the right.')], { headAB: 'N', status: 'DERIVED' });
walk('C0_LOBBY', 'CD_0', [D('Proceed through the opening at the bottom of the stairs. Travel from Zone C (blue) into Zone D (gold). Proceed to the right')], { headAB: 'W' });
walk('CD_0', 'SHUTTLE', [D('Turn left. Shuttleworth Auditorium (D0-104) is on the right.')], { status: 'CONFLICTING', note: 'E1 route reaches it without changing level although room is D0.' });
walk('CD_0', 'D_EL_0', [D('Proceed to the right and continue straight ahead. Take one of the Zone D elevators')]);
walk('D_EL_0', 'HULC', [D('Pass the Zone “D” elevators. HULC Registration (D0-101) is on the left.')]);

/* ---- Cheapside garage ---- */
walk('CS_PARK', 'C_EL_G', [{ src: 'PARKING', quote: 'The elevator in the garage connects directly with … Medical Imaging Centre (Level 0) and … Surgical Centre (Level 1)' }, D('There is access to elevators inside the parking garage.')], { stepFree: 'yes' });

/* ---- Zone B upper floors ---- */
for (const L of [1, 2, 3, 4, 5, 6] as Level[]) {
  if (L > 1) walk(`BJ_${L}`, `B_EL_${L}`, [D('From the elevator lobby, turn left / turn right.')], { status: 'DERIVED' });
}
walk('BJ_2', 'COMPASS_2', [D('From the elevator lobby turn left. Proceed down the corridor and turn right at the compass intersection.')]);
walk('BJ_2', 'THOMPSON', [D('From the elevator lobby, turn left. Continue down the main hallway. Thompson Amphitheatre (B2-075) is on the left.')]);
walk('THOMPSON', 'COMPASS_2', [D('Proceed down the corridor')], { status: 'DERIVED' });
walk('BJ_2', 'BE_2', [D('From the elevator lobby, turn right. Proceed to the end of the corridor.')]);
walk('BJ_2', 'CATARACT', [D('From the elevator lobby, turn right. Proceed to the end of the corridor. Cataract (B2-602) is on the left.')]);
walk('BJ_2', 'HEADNECK', [D('From the elevator lobby, turn right. Proceed to the end of the corridor. Head and Neck (B2-501) is on the right.')]);
walk('COMPASS_2', 'B2_HIM_J', [D('Turn right at the compass intersection. Go through this door.')], { door: 'closed' });
walk('B2_HIM_J', 'HIM', [D('Continue down the corridor, through the open door and turn right. Health Information Management (B2-659) will be in front of you.')], { door: 'open' });
walk('BJ_3', 'B3030', [D('From the elevator lobby, turn left. The Central Registration desk (B3-030) is on the right.')]);
walk('BJ_4', 'THYROID', [D('From the elevator lobby, turn left to enter the clinic. The waiting room is on the right (B4‐077).')]);
walk('THYROID', 'COMPASS_4', [D('Proceed down this corridor, past the compass intersection.')], { status: 'DERIVED', costMul: 1.6 });
walk('COMPASS_4', 'VOLUNTEER', [D('Volunteer Services (B4‐048) is the second door on the right.')]);
walk('VOLUNTEER', 'AB_4', [D('Proceed down the corridor to Zone B (red).')], { status: 'DERIVED', costMul: 1.6 });
walk('AB_4', 'A4_J', [D('Exit the elevator. Turn left. Proceed down the corridor to Zone B (red).')]);
walk('COMPASS_4', 'PHYSIO', [D('At the intersection turn right. Physiotherapy registration is the first door on the right (B4‐053).')]);
walk('BJ_4', 'COLPO', [D('From the elevator lobby, turn right and proceed down the corridor. Colposcopy (B4-507) is on the right.')]);
walk('COLPO', 'UROLOGY', [D('Proceed to the end of the corridor. The registration area is on the left (B4-602).')]);
walk('BJ_5', 'COMPASS_5', [D('From the elevator lobby, turn left. Proceed down this corridor and turn right at the compass intersection.')]);
walk('COMPASS_5', 'MI_B5', [D('Go through the closed door into Medical Imaging. The registration area (B5-204) is the second door on the right.')], { door: 'closed' });
walk('BJ_5', 'DIABETES', [D('From the elevator lobby, turn right and proceed down the corridor. Check in at the Diabetes and Endocrinology reception desk on your right.')]);
walk('BJ_6', 'INPATIENT', [D('From the elevator lobby, turn right. Proceed down the corridor. Inpatient surgical registration (B6-024) will be on your right.')]);
walk('INPATIENT', 'BE_6', [D('Proceed to the end of this corridor.')]);
walk('BE_6', 'B6_NE', [D('Turn left and continue to the end of this corridor.')]);
walk('B6_NE', 'ANESTH', [D('Turn left. Anesthesia (B6-665) will be in front of you.')]);

/* ---- Zone A upper floors ---- */
walk('A_EL_2', 'A2_J', [D('Exit the elevator and turn right.')], { headAB: 'S' });
walk('A2_J', 'MEDAFF', [D('Follow the corridor. Medical Affairs (A2-014) is on the right.')]);
walk('MEDAFF', 'ADAMS', [D('Past the windows on your left. The Adams Executive Boardroom (A2‐041) is on the left.')]);
walk('ADAMS', 'A2_WEND', [D('Follow the corridor to the end (an elevator will be in front of you).')]);
walk('A2_WEND', 'CHAPEL', [D('Turn right. The Chapel (A2-202) is straight ahead to the left.')]);
walk('A2_WEND', 'A2039', [D('Turn left. The meeting room (A2‐039) is on the right.')]);
walk('A_EL_3', 'HR', [D('Exit the elevator. Human Resources (A3-003) will be in front of you.')], { headAB: 'S' });
walk('A_EL_4', 'A4_J', [D('Exit the elevator.')], { headAB: 'S' });
walk('A4_J', 'CLINTRIALS', [D('Exit the elevator. Clinical Trials (A4-003) will be in front of you.')], { headAB: 'S' });

/* ---- Zone D upper floors ---- */
walk('D_EL_2', 'D2_NW', [D('Exit the elevator. Turn left and go around the corner.')]);
walk('D2_NW', 'RHEUM', [D('This is the waiting room, please register at the front desk.')]);
walk('D_EL_3', 'OTPT', [D('Exit the elevator. The registration desk will be on the left.')]);

/* ---- Elevator rides: every pair of levels within a bank ---- */
for (const [bank, def] of Object.entries(BANKS) as [BankId, (typeof BANKS)[BankId]][]) {
  const ids = def.levels.map((L) => {
    if (bank === 'GG') return L === -1 ? 'GG_EL_T' : 'GG_EL_P';
    if (bank === 'A' && L === -1) return 'A_EL_T';
    if (bank === 'C' && L === -1) return 'C_EL_G';
    return `${bank}_EL_${L}`;
  });
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      edge(ids[i], ids[j], 'elevator', def.status === 'OFFICIAL' ? 'OFFICIAL' : 'DERIVED', [D(`Take one of the ${def.label} to Level …`)], { stepFree: 'yes' });
}

/* ---- FICTIONAL restricted link (security demo). Never part of a real route. ---- */
edge('INFO_E2', 'X_DOOR', 'restricted', 'FICTIONAL', [{ src: 'FICTION', quote: 'Invented staff-escort corridor for the training demo' }]);
edge('X_DOOR', 'X_LAB', 'restricted', 'FICTIONAL', [{ src: 'FICTION', quote: 'Invented training room' }]);

export const NODE_BY_ID: Record<string, GNode> = Object.fromEntries(NODES.map((n) => [n.id, n]));

export function levelLabel(level: Level): string {
  return level === -1 ? 'B' : String(level);
}

/**
 * Official-route anchoring. Every official "From the Cheapside parking garage" route goes up to
 * Level 0 (C0) first ("Take one of the Zone C elevators up to Level 0 (C0)"), so routes from that
 * origin are forced through the C0 elevator stop. (WSIB's page says C1 — recorded as CONFLICTING.)
 */
export const ORIGIN_VIA: Record<string, string> = {
  CS_PARK: 'C_EL_0',
  // Every official "From Grosvenor Parking Garage" route uses the tunnel ("the safest and most
  // accessible route"), so the garage origin is anchored through the tunnel's Zone A elevators.
  GG_EL_P: 'A_EL_T',
};
