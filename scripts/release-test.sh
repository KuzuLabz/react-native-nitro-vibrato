#!/bin/bash

set -e

echo "Starting the test release process..."

cd package
cp ../README.md README.md
bun release minor --dry-run --ci
rm README.md

echo "Successfully tested NitroVibrato release!"