#!/bin/bash

echo "🔍 Looking for JAR files..."
ls -la target/ || echo "❌ No target directory found"

echo "🔍 Finding JAR files..."
JAR_FILE=$(find target -name "*.jar" -type f | head -1)

if [ -z "$JAR_FILE" ]; then
    echo "❌ No JAR file found in target/"
    echo "📁 Current directory contents:"
    ls -la
    echo "📁 Target directory contents:"
    ls -la target/ 2>/dev/null || echo "Target directory doesn't exist"
    exit 1
fi

echo "✅ Found JAR file: $JAR_FILE"
echo "🚀 Starting application on port ${PORT:-8082}..."

java -jar "$JAR_FILE" --server.port=${PORT:-8082} 