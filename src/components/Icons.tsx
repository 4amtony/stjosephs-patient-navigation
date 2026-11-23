import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 22) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });

export const Globe = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>);
export const Person = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c.8-4 3.6-6 7-6s6.2 2 7 6" /></svg>);
export const Home = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" /></svg>);
export const Search = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const Car = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 16V11l2-5h10l2 5v5" /><path d="M3 16h18v3H3z" /><circle cx="7.5" cy="19" r="1.2" /><circle cx="16.5" cy="19" r="1.2" /></svg>);
export const Bus = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="5" y="3" width="14" height="15" rx="3" /><path d="M5 11h14M8 21v-3M16 21v-3" /><circle cx="8.5" cy="14.5" r=".8" /><circle cx="15.5" cy="14.5" r=".8" /></svg>);
export const Taxi = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M9 5h6l1 3" /><path d="M4 16v-4l2-4h12l2 4v4" /><path d="M3 16h18v3H3z" /></svg>);
export const Pin = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>);
export const Qr = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4M20 17v3" /></svg>);
export const Elevator = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M12 3v18M7.5 9 9 7l1.5 2M13.5 15 15 17l1.5-2" /></svg>);
export const ArrowUp = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 20V5M6 11l6-6 6 6" /></svg>);
/** Physical turn arrows: NEVER mirrored in RTL (left means left). */
export const TurnLeft = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M17 20v-7a4 4 0 0 0-4-4H5" /><path d="m9 5-4 4 4 4" /></svg>);
export const TurnRight = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M7 20v-7a4 4 0 0 1 4-4h8" /><path d="m15 5 4 4-4 4" /></svg>);
export const UTurn = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M8 20V9a4 4 0 0 1 8 0v4" /><path d="m12 10 4 4 4-4" /></svg>);
export const Door = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18" /><circle cx="15" cy="12" r=".9" /></svg>);
export const Flag = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>);
/** Logical direction chevrons: mirrored in RTL via .flip-rtl */
export const ChevronNext = ({ size, ...p }: P) => (<svg {...base(size)} className="flip-rtl" {...p}><path d="m9 6 6 6-6 6" /></svg>);
export const ChevronBack = ({ size, ...p }: P) => (<svg {...base(size)} className="flip-rtl" {...p}><path d="m15 6-6 6 6 6" /></svg>);
export const Check = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m5 12 5 5 9-10" /></svg>);
export const Warn = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17v.01" /></svg>);
export const Info = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></svg>);
export const Speaker = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></svg>);
export const Stop = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="6" y="6" width="12" height="12" rx="2" /></svg>);
export const Lock = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
export const Unlock = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></svg>);
export const MapIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></svg>);
export const TextIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>);
export const Layers = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3 13 9 5 9-5" /></svg>);
export const Print = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2" /><rect x="6" y="14" width="12" height="7" /></svg>);
export const Wheelchair = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="4" r="1.6" /><path d="M11 7v6h5l2 5M11 10h5" /><path d="M8 11.5a5 5 0 1 0 6.8 6.6" /></svg>);
export const Close = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const Settings = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>);
export const Compass = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>);
export const Tunnel = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3 20V12a9 9 0 0 1 18 0v8" /><path d="M8 20v-6a4 4 0 0 1 8 0v6" /></svg>);
export const Sparkle = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>);
export const Book = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" /><path d="M8 7h7M8 11h7" /></svg>);
export const Logo = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
    <path d="M12 21s6.5-5.8 6.5-11.2A6.5 6.5 0 0 0 5.5 9.8C5.5 15.2 12 21 12 21z" />
    <path d="M12 7v6M9 10h6" />
  </svg>
);
