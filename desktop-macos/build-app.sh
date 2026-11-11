#!/bin/bash
set -euo pipefail

CLT_DEVELOPER_DIR="/Library/Developer/CommandLineTools"
if [ -d "$CLT_DEVELOPER_DIR" ]; then export DEVELOPER_DIR="$CLT_DEVELOPER_DIR"; fi
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$SOURCE_DIR/build"
if [ "$#" -gt 0 ]; then OUTPUT_DIR="$1"; fi
APP_PATH="$OUTPUT_DIR/AAAAA Usage.app"
TMPDIR_VALUE="$(printenv TMPDIR || printf /tmp)"
CACHE_DIR="$TMPDIR_VALUE/aaaaa-usage-swift-cache"
MACH_ARCH="$(uname -m)"
HOST_MAJOR="$(sw_vers -productVersion | cut -d. -f1)"
SDK_PATH="/Library/Developer/CommandLineTools/SDKs/MacOSX$HOST_MAJOR.sdk"
if [ ! -d "$SDK_PATH" ]; then SDK_PATH="$(xcrun --sdk macosx --show-sdk-path)"; fi
SDK_VERSION="$(/usr/libexec/PlistBuddy -c 'Print :Version' "$SDK_PATH/SDKSettings.plist")"
MIN_MACOS="13.0"
mkdir -p "$OUTPUT_DIR" "$CACHE_DIR"
rm -rf "$APP_PATH"
mkdir -p "$APP_PATH/Contents/MacOS" "$APP_PATH/Contents/Resources"

cp "$SOURCE_DIR/Info.plist" "$APP_PATH/Contents/Info.plist"
printf 'APPL????' > "$APP_PATH/Contents/PkgInfo"
cp -R "$SOURCE_DIR/Resources/." "$APP_PATH/Contents/Resources/"

swiftc \
  -sdk "$SDK_PATH" \
  -target "$MACH_ARCH-apple-macosx$MIN_MACOS" \
  -module-cache-path "$CACHE_DIR" \
  -framework AppKit \
  -framework WebKit \
  -framework Security \
  "$SOURCE_DIR/App.swift" \
  "$SOURCE_DIR/UsageProvider.swift" \
  "$SOURCE_DIR/DeepSeekOAuth.swift" \
  "$SOURCE_DIR/HUDController.swift" \
  -o "$APP_PATH/Contents/MacOS/AAAAAUsage"

VTOOL_OUTPUT="$APP_PATH/Contents/MacOS/AAAAAUsage.vtool"
vtool -set-build-version macos "$MIN_MACOS" "$SDK_VERSION" \
  -replace -output "$VTOOL_OUTPUT" "$APP_PATH/Contents/MacOS/AAAAAUsage"
mv "$VTOOL_OUTPUT" "$APP_PATH/Contents/MacOS/AAAAAUsage"
chmod +x "$APP_PATH/Contents/MacOS/AAAAAUsage"
printf 'Built %s\n' "$APP_PATH"
