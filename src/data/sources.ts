/** Source ledger. Retrieval date for all live pages: 2026-11-19. See docs/SOURCE_MAP.md. */
export interface Source {
  id: string;
  title: string;
  url: string;
  retrieved: string;
  edition?: string;
  used: string;
}

const R = '2026-11-19';
const SJH = 'https://www.sjhc.london.on.ca';

export const SOURCES: Record<string, Source> = {
  SITEMAP: {
    id: 'SITEMAP',
    title: "St. Joseph's Hospital wayfinding site map (PDF)",
    url: `${SJH}/media/5882/download`,
    retrieved: R,
    edition: 'Map dated July 2019; PDF modified 2021-02-25',
    used: 'Zone A–F footprints and relative positions, entrances 1/2/4, zone-elevator icons, compass intersection, tunnel, both garages, Level 1 links C↔B and D↔E. Inspected visually.',
  },
  DIRECTORY: {
    id: 'DIRECTORY',
    title: "St. Joseph's Hospital: Directions to All Program and Services",
    url: `${SJH}/how-to-get-there/st-josephs-hospital-directions-to-all-program-and-services`,
    retrieved: R,
    used: 'Destination index, room numbers, aliases ("see …"), phone extensions, Paratransit → Entrance 2.',
  },
  DIRECTIONS: {
    id: 'DIRECTIONS',
    title: 'Program and Service Detailed Directions (A–W, conference rooms)',
    url: `${SJH}/st-josephs-hospital-program-and-service-detailed-directions-b`,
    retrieved: R,
    used: '165 verbatim step lists from Entrances 1, 2, 3, 4 and both garages; turn directions used to validate the graph.',
  },
  PARKING: {
    id: 'PARKING',
    title: "Parking at St. Joseph's Hospital",
    url: `${SJH}/patients-and-visitors/our-locations/st-josephs-hospital/parking-st-josephs-hospital`,
    retrieved: R,
    used: 'Garage capacities, Cheapside hours (Mon–Fri 5:30–17:30, closed weekends), tunnel = "safest and most accessible route", accessible spaces, rates, transit routes, drop-off areas.',
  },
  LOCATION: {
    id: 'LOCATION',
    title: "St. Joseph's Hospital location page",
    url: `${SJH}/patients-and-visitors/our-locations/st-josephs-hospital`,
    retrieved: R,
    used: 'Duplicate parking/transit text (lists bus route "15 Huron Heights" where parking page lists "21").',
  },
  VISITING: {
    id: 'VISITING',
    title: 'Visiting information – after-hours access',
    url: `${SJH}/patients-and-visitors/visiting-information`,
    retrieved: R,
    used: 'Entrance opening hours (E1, E2, E4), buzzer at Entrance 2, B6 after-hours escort.',
  },
  ACCESSIBILITY: {
    id: 'ACCESSIBILITY',
    title: 'Accessibility (incl. language services)',
    url: `${SJH}/patients-and-visitors/visiting-information/accessibility`,
    retrieved: R,
    used: 'Wheelchairs at major entrances, Security ext. 44555, emergency 55555, interpreters arranged in advance / switchboard (English-only line), sign-language interpreters, TTY.',
  },
  LANGUAGE_STORY: {
    id: 'LANGUAGE_STORY',
    title: '“Speaking their language” (volunteer language buttons & interpretation iPads)',
    url: `${SJH}/news-and-media/our-stories/speaking-their-language-0`,
    retrieved: R,
    edition: 'Page modified 2026-08-26',
    used: 'Language-ID buttons worn by Information Desk volunteers (14 languages incl. Arabic, Mandarin, French, Hindi), interpretation iPads at information desks, volunteers do not accompany patients or translate medical information.',
  },
  GARAGE_REPLACEMENT: {
    id: 'GARAGE_REPLACEMENT',
    title: 'Grosvenor Street Parking Garage Replacement',
    url: `${SJH}/patients-and-visitors/our-locations/st-josephs-hospital/parking-st-josephs-hospital/replacement`,
    retrieved: R,
    used: 'Planning stage; construction anticipated late 2027, new garage early 2029; existing garage stays open meanwhile.',
  },
  GG_MAP: {
    id: 'GG_MAP',
    title: 'Grosvenor Street Parking Garage printable map',
    url: `${SJH}/media/7805/download?attachment`,
    retrieved: R,
    edition: 'PDF created 2018-11, modified 2020-05',
    used: 'Accessible parking area and tunnel label (visual).',
  },
  CS_MAP: {
    id: 'CS_MAP',
    title: 'Cheapside Street Parking Garage printable map',
    url: `${SJH}/media/7570/download?attachment`,
    retrieved: R,
    edition: 'PDF dated Nov 2018',
    used: 'Visitor vs staff parking areas (visual).',
  },
  SCHEMATIC: {
    id: 'SCHEMATIC',
    title: 'Team 3 schematic reconstruction',
    url: 'docs/DATA_COVERAGE.md',
    retrieved: R,
    used: 'Approximate geometry placed to make official turn instructions consistent. Not a floor plan; not to scale.',
  },
  FICTION: {
    id: 'FICTION',
    title: 'Fictional training content (security demo)',
    url: 'docs/PRODUCT_DECISIONS.md',
    retrieved: R,
    used: 'Invented restricted training annex; does not represent any real hospital space or control.',
  },
};

export function sourceUrl(id: string): string {
  return SOURCES[id]?.url ?? '#';
}
