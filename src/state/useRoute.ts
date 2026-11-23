import { useMemo } from 'react';
import { CHECKPOINT_BY_ID } from '../data/checkpoints';
import { DEST_BY_ID, officialRouteFrom } from '../data/destinations';
import { planRoute } from '../engine/router';
import { assessRoute, buildSteps } from '../engine/steps';
import type { Session } from './session';

export function useRoute(s: Pick<Session, 'destId' | 'originCp' | 'prefs' | 'unlocked'>) {
  return useMemo(() => {
    const dest = s.destId ? DEST_BY_ID[s.destId] : null;
    const cp = s.originCp ? CHECKPOINT_BY_ID[s.originCp] : null;
    if (!dest || !cp) return { dest, cp, result: null, steps: [], quality: null, official: undefined };
    const result = planRoute(cp.node, dest.node, { stepFree: s.prefs.stepFree, accessUnlocked: s.unlocked });
    const steps = result.ok ? buildSteps(result.nodes, result.edges, cp.facing) : [];
    const quality = result.ok ? assessRoute(steps, result.edges) : null;
    const official = officialRouteFrom(dest, cp.node);
    return { dest, cp, result, steps, quality, official };
  }, [s.destId, s.originCp, s.prefs.stepFree, s.unlocked]);
}
