#!/bin/bash

echo "🤖 Building Sound Reverse Android App..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 11 or higher."
    echo "   On macOS: brew install openjdk@11"
    exit 1
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME is not set. Please install Android Studio and set ANDROID_HOME."
    echo "   Or run: npx cap open android"
    exit 1
fi

echo "✅ Java found: $(java -version 2>&1 | head -n 1)"
echo "✅ Android SDK: $ANDROID_HOME"

# Build web app
echo "📦 Building web app..."
npm run build

# Sync with Android
echo "🔄 Syncing with Android..."
npx cap sync android

# Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo "🚀 You can now install this APK on your Android device!"
else
    echo "❌ APK build failed. Please check the errors above."
    exit 1
fi
