
# [DATASIM](https://github.com/yetanalytics/datasim) test

## Get Started

- clone repository
- init & update submodules
  - `git submodule init`
  - `git submodule update`
- compile DATASIM CLI (needs DATASIM dependencies: JDK >= 8.x, Clojure)
  - `./compile-datasim-cli.sh`
- install web app dependencies (needs Node.js)
  - `cd web`
  - `npm install`
  - `cd ..`
- generate DATASIM input
  - xAPI Profile, actors, alignments can be adjusted in `input-generator/datasim-input.js`
      - Change constant `numberOfActors` to change the number of actors.
      - change alignments: comment some out or add new ones
  - Simulation params can be adjusted in `input-generator/gen-datasim-input.js`
  - generate input: `node input-generator/gen-datasim-input.js`
  - output file: `generated-input.json`
- run alignments influence test (Necessary at the moment so that the web app can be compiled.)
  - `node run-alignments-influence-test.js`
- generate xAPI statements
  - (optional) regenerate DATASIM input (otherwise input from last alignments influence test is used)
  - `./gen-sim-statements.sh`
- start web app
  - `cd web`
  - `npm run develop` or `yarn develop`
  - open web app in browser, url logged in console (default: http://localhost:1234)
- now
  - change values
  - in another shell: regenerate DATASIM input, regenerate statements
  - see changes in web app (updates automatically if running)
