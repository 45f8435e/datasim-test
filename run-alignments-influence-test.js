import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { datasimInputGen } from './input-generator/datasim-input.js';

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

// -------------------------------------------------------------------------------------------------
// getDates

function getDates(days) {
  const startDate = new Date('2021-12-06T00:00:00.000Z');
  const endDate = new Date(startDate);

  endDate.setUTCDate(startDate.getUTCDate() + days - 1);
  endDate.setUTCHours(23, 59, 0, 0);

  return {
    startDate,
    endDate,
  };
}

// -------------------------------------------------------------------------------------------------
// run

function run(days, withAlignments) {
  const { startDate, endDate } = getDates(days);

  console.log(' -> running', days, withAlignments ? 'with' : 'without', 'alignments', '(end:', endDate.toISOString(), ')');

  const simInput = datasimInputGen.getSimInput({
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    max: 1000000,
    timezone: 'Europe/Berlin',
    seed: 6
  });

  fs.writeFileSync(
    path.resolve(DIRNAME, 'generated-input.json'),
    JSON.stringify(
      {
        ...simInput,
        alignments: withAlignments ? simInput.alignments : [],
      },
      undefined,
      2,
    ),
  );

  execFileSync(
    path.resolve(DIRNAME, 'gen-sim-statements.sh'),
    {
      stdio: 'pipe',
    },
  );
}

// -------------------------------------------------------------------------------------------------
// exec

const results = [];

function countStatements(days, withAlignments) {
  console.log('    counting', days, withAlignments ? 'with' : 'without', 'alignments');

  const statements = JSON.parse(fs.readFileSync(path.resolve(DIRNAME, 'out.json')).toString());

  const { startDate, endDate } = getDates(days);

  const result = {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    withAlignments,
    actors: {},
  };

  statements.forEach(statement => {
    if (!statement.verb.id.endsWith('test/failed')) {
      return;
    }

    if (!result.actors[statement.actor.mbox]) {
      result.actors[statement.actor.mbox] = 0;
    }

    result.actors[statement.actor.mbox] += 1;
  });

  results.push(result);

  return statements.length;
}

[
  1, 2, 4,
  ...new Array(8).fill(null).map((_, index) => (index + 1) * 7),
].forEach(days => {
  const start = new Date();

  console.log('running', days, start.toISOString());

  run(days, false);
  const numberOfStatementsWithout = countStatements(days, false);

  run(days, true);
  const numberOfStatementsWith = countStatements(days, true);

  console.log('done', days, new Date().getTime() - start.getTime(), 'ms, statements:', 'with:', numberOfStatementsWithout, ', without:', numberOfStatementsWith);
});

fs.writeFileSync(
  path.resolve(DIRNAME, 'web/src/alignments-influence-test-results.json'),
  JSON.stringify(
    results,
    undefined,
    2,
  ),
);
