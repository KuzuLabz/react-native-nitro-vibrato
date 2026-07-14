#!/bin/bash
set -e

cd ./rust/vibrato-nitro/native

TARGET_DIR="../target"
FRAMEWORK_NAME="VibratoNative"
CRATE_NAME="vibrato_native"
OUTPUT_DIR="../../../ios/Frameworks"
LIBS_DIR="ios/libs"
HEADER_DIR="ios/libs/headers"
HEADER_NAME="vibrato.h"

echo "📁 Cleaning up old artifacts..."
rm -rf "$LIBS_DIR"
rm -rf "$OUTPUT_DIR/$FRAMEWORK_NAME.xcframework"
mkdir -p "$LIBS_DIR/device"
mkdir -p "$LIBS_DIR/simulator"
mkdir -p "$LIBS_DIR/headers"
mkdir -p "$OUTPUT_DIR"

# Compile targets
echo "🦀 Compiling Rust targets..."
cargo build --release --target aarch64-apple-ios
cargo build --release --target aarch64-apple-ios-sim
cargo build --release --target x86_64-apple-ios


cp "${TARGET_DIR}/aarch64-apple-ios/release/lib${CRATE_NAME}.a" "${LIBS_DIR}/device/lib${CRATE_NAME}.a"

echo "🧬 Stitching simulator slices into a universal binary via lipo..."
lipo -create \
  "${TARGET_DIR}/aarch64-apple-ios-sim/release/lib${CRATE_NAME}.a" \
  "${TARGET_DIR}/x86_64-apple-ios/release/lib${CRATE_NAME}.a" \
  -output "$LIBS_DIR/simulator/lib${CRATE_NAME}.a"

cbindgen --config cbindgen.toml --crate uniffi --output "$HEADER_DIR/$HEADER_NAME"


echo "💎 Assembling modern XCFramework container..."
xcodebuild -create-xcframework \
  -library "$LIBS_DIR/device/lib${CRATE_NAME}.a" \
  -headers "${HEADER_DIR}" \
  -library "$LIBS_DIR/simulator/lib${CRATE_NAME}.a" \
  -headers "${HEADER_DIR}" \
  -output "$OUTPUT_DIR/$FRAMEWORK_NAME.xcframework"

echo "🧹 Cleaning up intermediate static objects..."
rm -rf "$LIBS_DIR"

echo "✅ Success! Framework generated at:"
echo "📂 $OUTPUT_DIR/$FRAMEWORK_NAME.xcframework"