import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { datasimInputGen } from './datasim-input.js';

const DIRNAME = path.dirname(fileURLToPath(import.meta.url));

// -------------------------------------------------------------------------------------------------
// params & save to file

fs.writeFileSync(
  path.resolve(DIRNAME, '../generated-input.json'),
  JSON.stringify(
    datasimInputGen.getSimInput({
      start: '2021-12-06T00:00:00.000Z',
      end: '2021-12-06T23:59:00.000Z',
      max: 1000000,
      timezone: 'Europe/Berlin',
      seed: 6
    }),
    undefined,
    2,
  ),
);
