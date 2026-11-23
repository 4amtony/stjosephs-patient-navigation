/**
 * Prints how many official route variants the graph reproduces turn-for-turn.
 *   npx vite-node scripts/validate-routes.ts [--all]
 */
import { summary, validateAll } from '../src/engine/validate';

const checks = validateAll();
const s = summary(checks);
console.log(`Official route variants checked: ${s.total} (routable: ${s.routed})`);
console.log(`Turn sequence identical to official text: ${s.turns}/${s.total}`);
console.log(`Final side (left/right/ahead) identical: ${s.sides}/${s.sideTotal}`);
console.log(`Both identical: ${s.both}/${s.total}`);
const bad = checks.filter((c) => !(c.turnsMatch && c.sideMatch));
if (process.argv.includes('--all')) {
  for (const c of bad) console.log(`✗ ${c.origin} → ${c.dest}: official [${c.officialTurns}] side=${c.officialSide} | generated [${c.generatedTurns}] side=${c.generatedSide}`);
}
