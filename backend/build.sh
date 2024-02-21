#!/bin/bash

# Define paths
SKETCH_DIR="/var/www/html/storage/app/sketch"
BUILD_DIR="$SKETCH_DIR/build"

# Ensure the build directory exists and is empty
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Run arduino-cli compile command
/usr/local/bin/arduino-cli compile -b arduino:avr:uno -e --output-dir "$BUILD_DIR" "$SKETCH_DIR"