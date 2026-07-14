#!/bin/bash
set -e

cd ./rust/vibrato-nitro/native

JNI_DIR="../../../android/src/main/jniLibs"

rm -rf "$JNI_DIR"

mkdir -p "$JNI_DIR"
# mkdir -p "$JNI_DIR"
# mkdir -p "$JNI_DIR"

# Build target architectures
cargo ndk -t arm64-v8a -o "$JNI_DIR" build --release
cargo ndk -t armeabi-v7a -o "$JNI_DIR" build --release
cargo ndk -t x86_64 -o "$JNI_DIR" build --release

# Generate the shared header
cbindgen --config cbindgen.toml --crate native --output ../../../android/src/main/cpp/vibrato.h