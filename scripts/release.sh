#!/bin/bash

set -e

echo "Starting the release process..."
echo "Provided options: $@"

echo "Publishing 'react-native-nitro-vibrato' to NPM"
cd package
cp ../README.md README.md
bun release $@
rm README.md

echo "Creating a Git bump commit and GitHub release"
cd ..
bun run release-it $@

echo "Successfully released NitroVibrato!"