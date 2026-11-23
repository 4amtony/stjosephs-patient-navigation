/**
 * Arrival options: garages, entrances, drop-off and transit. All facts below are quoted or
 * paraphrased from official pages retrieved 2026-11-19 (PARKING, VISITING, LOCATION, DIRECTORY).
 * Nothing here is live: no occupancy, no reservations, no sensors.
 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface OpenWindow {
  days: Weekday[];
  open: string; // "05:30"
  close: string; // "17:30"
}

export interface Garage {
  id: 'grosvenor' | 'cheapside';
  name: string;
  node: string; // graph start node
  spaces: number;
  hours: OpenWindow[] | null; // null = not published
  hoursNote: string;
  rates: string;
  accessible: string;
  connection: string;
  bestFor: string;
  caveats: string[];
  source: string;
}

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];

export const GARAGES: Garage[] = [
  {
    id: 'cheapside',
    name: 'Cheapside Street parking garage',
    node: 'CS_PARK',
    spaces: 132,
    hours: [{ days: WEEKDAYS, open: '05:30', close: '17:30' }],
    hoursNote: 'Open 5:30 am – 5:30 pm, Monday to Friday. Closed on weekends.',
    rates: 'Rates not published on the parking page; pay station is by the main elevators next to the gift shop in the Zone C lobby.',
    accessible: 'Printable garage map lists accessible spaces.',
    connection: 'The elevator in the garage connects directly with the Medical Imaging Centre (Level 0) and the Surgical Centre (Level 1). For Zone D, exit on Level 0 and walk across the lobby to the west side.',
    bestFor: 'Officially “the closest lot for outpatients with appointments in Zones C and D” (Medical Imaging, Hand and Upper Limb Centre, Breast Care Centre, Rheumatology, Physiotherapy/OT, WSIB, Shuttleworth Auditorium).',
    caveats: ['Small garage (132 spaces); parking is limited.', 'Entrance on Cheapside Street just east of Richmond Street.'],
    source: 'PARKING',
  },
  {
    id: 'grosvenor',
    name: 'Grosvenor Street parking garage',
    node: 'GG_EL_P',
    spaces: 989,
    hours: null,
    hoursNote: 'Opening hours are not listed on the parking page. Tunnel access hours are not published.',
    rates: '$4 first hour, then $2 per half hour, maximum $8.75 after 2 hours (daily). Pay stations accept coins and credit cards.',
    accessible: 'Accessible parking on each floor at the west end (closest to Richmond & Grosvenor), next to the elevator to the street-level wheelchair-accessible ramp or the underground tunnel.',
    connection: 'Across Grosvenor Street from Entrance 1. The tunnel (elevators in the north-west corner → Level B) leads to the Zone A elevators and is officially described as “the safest and most accessible route”.',
    bestFor: 'Zones A and B (main entrance side), and anyone who wants the officially most accessible indoor route (tunnel).',
    caveats: ['Garage replacement is planned: construction anticipated late 2027, new garage early 2029; the existing garage stays open meanwhile (planning stage).'],
    source: 'PARKING',
  },
];

export interface EntranceInfo {
  id: string;
  node: string;
  outside: string;
  name: string;
  hours: OpenWindow[];
  hoursNote: string;
  afterHours: string;
  dropOff: boolean;
  notes: string[];
}

export const ENTRANCES: EntranceInfo[] = [
  {
    id: 'ENTRANCE_1', node: 'E1', outside: 'E1_OUT', name: 'Grosvenor Entrance 1 (main entrance)',
    hours: [{ days: WEEKDAYS, open: '05:30', close: '18:00' }],
    hoursNote: 'Open Monday to Friday 5:30 am – 6:00 pm.',
    afterHours: 'After hours, go to Grosvenor Entrance 2 and use the buzzer beside the door to contact security.',
    dropOff: true, notes: ['Leads into the Zone A lobby with an information desk.'],
  },
  {
    id: 'ENTRANCE_2', node: 'E2', outside: 'E2_OUT', name: 'Grosvenor Entrance 2 (Urgent Care entrance)',
    hours: [{ days: WEEKDAYS, open: '05:30', close: '18:00' }, { days: [0, 6], open: '07:00', close: '16:00' }],
    hoursNote: 'Open Monday to Friday 5:30 am – 6:00 pm; Saturday, Sunday and statutory holidays 7:00 am – 4:00 pm.',
    afterHours: 'After hours, use the buzzer beside the door to contact security.',
    dropOff: true, notes: ['Paratransit drops patients off here.', 'Limited accessible street parking across from this entrance.', 'B5 Medical Imaging appointments after 6 pm: use this entrance and press the buzzer.'],
  },
  {
    id: 'ENTRANCE_4', node: 'E4', outside: 'E4_OUT', name: 'Cheapside Entrance 4',
    hours: [{ days: WEEKDAYS, open: '05:30', close: '20:00' }],
    hoursNote: 'Open Monday to Friday 5:30 am – 8:00 pm.',
    afterHours: 'After hours, go to Grosvenor Entrance 2 and use the buzzer.',
    dropOff: true, notes: ['Leads into the Zone C lobby (information/volunteer desk).', 'Bus stops close to the Cheapside Street entrances.'],
  },
  {
    id: 'ENTRANCE_3', node: 'E3', outside: 'E3_OUT', name: 'Wellington Entrance 3 (at the ramp)',
    hours: [], hoursNote: 'Hours not published.', afterHours: 'Use Grosvenor Entrance 2 buzzer after hours.', dropOff: false,
    notes: ['Only one official route starts here (to B0-644). Other routes from this entrance are derived.'],
  },
];

export const TRANSIT = {
  routes: ['6 Richmond', '13 Wellington', '1 Kipps Lane', '21 Huron Heights'],
  conflict: 'The location page lists “15 Huron Heights” where the parking page lists “21 Huron Heights”. Check the LTC trip planner.',
  stops: 'Bus stops are located along Richmond Street and close to the Cheapside Street entrances. The hospital is a few blocks north of Oxford Street.',
  phone: 'London Transit Commission: 519 451-1347',
  planner: 'https://www.londontransit.ca/plan-a-trip/routes-schedules/',
};

export const PARKING_GENERAL = {
  capacity: 'Both garages are often at capacity Monday to Thursday between 9:30 a.m. and 2 p.m. “Lot full” signs are posted when full.',
  alternatives: 'St. Joseph’s encourages public transit, taxi, or being dropped off. Drop-off areas: Entrances 1 and 2 (Grosvenor Street) and Entrance 4 (Cheapside Street). Metered street parking nearby.',
  office: 'Parking office: 519 646-6100 ext. 65113 (8 am – 4 pm, Mon–Fri). After hours: Precise ParkLink 1-888-783-7275.',
  dropOffRule: 'Vehicles left more than 10 minutes in patient drop-off areas may be ticketed.',
};

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export type OpenState = 'open' | 'closed' | 'unknown';

/** Is a place open on `day` at `time` ("HH:MM")? 'unknown' when hours aren't published. */
export function openAt(hours: OpenWindow[] | null, day: Weekday | null, time: string | null): OpenState {
  if (!hours || hours.length === 0) return 'unknown';
  if (day == null) return 'unknown';
  const wins = hours.filter((w) => w.days.includes(day));
  if (!wins.length) return 'closed';
  if (!time) return 'open';
  const t = toMin(time);
  return wins.some((w) => t >= toMin(w.open) && t < toMin(w.close)) ? 'open' : 'closed';
}

/** Minutes between visit time and the place closing that day (null if unknown/closed). */
export function minutesToClose(hours: OpenWindow[] | null, day: Weekday | null, time: string | null): number | null {
  if (!hours || day == null || !time) return null;
  const w = hours.find((x) => x.days.includes(day) && toMin(time) >= toMin(x.open) && toMin(time) < toMin(x.close));
  return w ? toMin(w.close) - toMin(time) : null;
}

export function isBusyWindow(day: Weekday | null, time: string | null): boolean {
  if (day == null || !time || ![1, 2, 3, 4].includes(day)) return false;
  const t = toMin(time);
  return t >= toMin('09:30') && t < toMin('14:00');
}
