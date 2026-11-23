/**
 * Developer tool: print the structured route between two graph nodes in plain English.
 *   npx vite-node scripts/debug-route.ts E1 BREAST [--stepfree]
 *   npx vite-node scripts/debug-route.ts all      (prints all demo routes)
 */
import { NODE_BY_ID } from '../src/data/graph';
import { planRoute as findRoute } from '../src/engine/router';
import { buildSteps } from '../src/engine/steps';

function describe(from: string, to: string, stepFree = false) {
  const r = findRoute(from, to, { stepFree });
  console.log(`\n=== ${from} → ${to}${stepFree ? ' (step-free)' : ''}`);
  if (!r.ok) return console.log('  FAIL:', r.reason);
  console.log('  path:', r.nodes.join(' → '));
  for (const s of buildSteps(r.nodes, r.edges)) {
    const t = s.turn !== 'straight' ? `[turn ${s.turn}] ` : '';
    const z = s.zoneFrom ? ` {zone ${s.zoneFrom}→${s.zoneTo}}` : '';
    const p = s.passed.length ? ` (past ${s.passed.join(', ')})` : '';
    const a = s.arrive ? ` ⇒ ${NODE_BY_ID[s.arrive.node].label} on the ${s.arrive.side}` : '';
    const lv = s.kind === 'elevator' ? ` ${s.bank} L${s.level}→L${s.levelTo}` : '';
    console.log(`  ${s.i + 1}. ${s.kind}${lv} ${t}to ${s.to}${z}${p}${s.door ? ' door:' + s.door : ''}${a}  [${s.status}/${s.stepFree}]`);
  }
}

const [a, b, flag] = process.argv.slice(2);
if (a === 'all' || !a) {
  const pairs: [string, string][] = [
    ['E4', 'BREAST'], ['CS_PARK', 'BREAST'], ['E1', 'BREAST'], ['E2', 'BREAST'], ['GG_EL_P', 'BREAST'],
    ['E1', 'MI_B5'], ['E2', 'MI_B5'], ['E2', 'B3030'], ['E1', 'B3030'], ['E4', 'B3030'], ['B_EL_5', 'B3030'],
    ['E2', 'CHAPEL'], ['GG_EL_P', 'CHAPEL'], ['E2', 'LAB'], ['E4', 'LAB'], ['E2', 'SADV'], ['E3', 'SADV'], ['E4', 'CAFE'],
    ['E1', 'HULC'], ['E4', 'HULC'], ['E2', 'PHYSIO'], ['E1', 'PHYSIO'], ['E2', 'ANESTH'], ['E2', 'HIM'], ['E4', 'MI_C0'], ['E1', 'MI_C0'],
    ['E2', 'X_LAB'], ['E1', 'INFO_E2'],
  ];
  for (const [f, t] of pairs) describe(f, t);
  describe('GG_EL_P', 'MI_B5', true);
  describe('GG_EL_P', 'MI_B5', false);
} else describe(a, b, flag === '--stepfree');
