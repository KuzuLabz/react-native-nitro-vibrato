#!/bin/bash
set -e

cd ../rust/vibrato-nitro/uniffi

# Compile targets
cargo build --target aarch64-apple-ios --release
cargo build --target aarch64-apple-ios-sim --release

# Create a unified XCFramework or fat library inside your ios/ folder
mkdir -p ../../../ios/Frameworks
mkdir -p ios/libs/device
mkdir -p ios/libs/simulator

cp target/aarch64-apple-ios/release/libvibrato_native.a ios/libs/device/libvibrato_native.a

# Combine them if needed or use xcrun to wrap into an XCFramework
lipo -create \
  target/aarch64-apple-ios-sim/release/libvibrato_native.a \
  target/x86_64-apple-ios/release/libvibrato_native.a \
  -output ios/libs/simulator/libvibrato_native.a

rm -rf ../../../ios/Frameworks/VibratoNative.xcframework

xcodebuild -create-xcframework \
  -library ios/libs/device/libvibrato_native.a \
  -headers ../../../android/src/main/cpp/vibrato.h \
  -library ios/libs/simulator/libvibrato_native.a \
  -headers ../../../android/src/main/cpp/vibrato.h \
  -output ../../../ios/Frameworks/VibratoNative.xcframework

rm -rf ios/libs

echo "XCFramework bundle complete!"