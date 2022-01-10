#!/bin/bash

# from datasim/Makefile

GROUP_ID="com.yetanalytics"
ARTIFACT_ID="datasim"
VERSION="0.1.0-SNAPSHOT"
MAIN_NS="com.yetanalytics.datasim.main"

# cd into datasim directory

cd ./datasim || exit

# clean

rm -rf target

# target/bundle/datasim_cli.jar

mkdir -p target/bundle
rm -f pom.xml
clojure -X:depstar uberjar :no-pom false :sync-pom true :aliases '[:cli]' :aot true :group-id "$GROUP_ID" :artifact-id "$ARTIFACT_ID"-cli :version "'$VERSION'" :jar target/bundle/datasim_cli.jar :main-class com.yetanalytics.datasim.main
rm -f pom.xml

# target/bundle/bin

mkdir -p target/bundle/bin
cp -r scripts/*.sh target/bundle/bin
chmod +x target/bundle/bin

# cd back into root directory

cd ../ || exit
