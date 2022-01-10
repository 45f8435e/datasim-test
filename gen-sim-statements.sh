#!/bin/bash

INPUT_PATH="$(PWD)/generated-input.json"
OUT_PATH="$(PWD)/out.json"
DATA_WEB_PATH="$(PWD)/web/src/statements.json"

cd datasim/target/bundle || exit

raw_out=$(bin/run.sh -i "$INPUT_PATH" generate)

json_out="["

seen_first=0

while read -r line
do
  if [ $seen_first -eq 1 ]; then
    json_out+=","
  fi

  seen_first=1

  json_out+=$line
done <<< "$raw_out"

json_out+="]"

cd ../../../ || exit

echo "$json_out" > "$OUT_PATH"
echo "$json_out" > "$DATA_WEB_PATH"

