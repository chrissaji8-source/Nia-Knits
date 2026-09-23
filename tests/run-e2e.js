#!/usr/bin/env node
/**
 * Nia Knits E2E Test Suite Runner
 * Runs all 4 Tiers of requirement-driven opaque-box tests and executes build verification.
 * Usage: node tests/run-e2e.js
 */

import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const testFiles = [
  'tests/tier1-feature-coverage/r1-showcase.test.js',
  'tests/tier1-feature-coverage/r2-basket.test.js',
  'tests/tier1-feature-coverage/r3-about.test.js',
  'tests/tier1-feature-coverage/r4-commission.test.js',
  'tests/tier2-boundary-corner/boundary-corner.test.js',
  'tests/tier3-cross-feature/cross-feature.test.js',
  'tests/tier4-real-world/real-world-scenarios.test.js',
  'tests/adversarial-stress.test.js',
  'tests/challenger2-empirical.test.js',
];

function runCommand(command, args, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const isWindows = process.platform === 'win32';
    const shellCommand = isWindows ? 'cmd.exe' : command;
    const shellArgs = isWindows ? ['/c', command, ...args] : args;

    const child = spawn(shellCommand, shellArgs, {
      cwd,
      stdio: 'inherit',
      shell: false,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise({ code });
      } else {
        rejectPromise(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      rejectPromise(err);
    });
  });
}

async function main() {
  console.log('\n======================================================');
  console.log('       NIA KNITS E2E TEST SUITE RUNNER                ');
  console.log('======================================================\n');
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Test Files: ${testFiles.length} suites across all Tiers & Challengers\n`);

  const startTime = Date.now();

  try {
    console.log('>>> [PHASE 1/2] Executing Complete E2E & Empirical Test Suite...');
    await runCommand('node', ['--test', ...testFiles], PROJECT_ROOT);
    console.log('\n[PASS] All E2E, requirement, adversarial and challenger tests passed successfully!\n');

    console.log('>>> [PHASE 2/2] Executing Clean Build Verification (npm run build)...');
    await runCommand('npm', ['run', 'build'], PROJECT_ROOT);
    console.log('\n[PASS] Build verification compiled cleanly with zero errors!\n');

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('======================================================');
    console.log(`  ALL CHECKS PASSED SUCCESSFULLY in ${totalDuration}s`);
    console.log('  - Tier 1: Feature Coverage (R1, R2, R3, R4) -> PASS');
    console.log('  - Tier 2: Boundary & Corner Cases          -> PASS');
    console.log('  - Tier 3: Cross-Feature Combinations       -> PASS');
    console.log('  - Tier 4: Real-World Scenarios             -> PASS');
    console.log('  - Adversarial Stress Suite (Challenger 1)  -> PASS');
    console.log('  - Empirical Verification (Challenger 2)    -> PASS');
    console.log('  - Build Verification: Clean Vite Compile   -> PASS');
    console.log('======================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n[FAIL] Test suite or build verification failed:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
