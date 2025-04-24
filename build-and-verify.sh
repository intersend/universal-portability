#!/bin/bash

echo "Cleaning dist directory..."
npm run clean

echo "Building package..."
npm run build

echo "Verifying build output..."

# Check if native type definitions were generated
if [ -f "./dist/native/index.d.ts" ]; then
  echo "✅ Native type definitions exist"
  
  # Create a root native.d.ts that re-exports from dist/native/index.d.ts
  echo "Creating dist/native.d.ts barrel file..."
  echo "export * from './native/index';" > ./dist/native.d.ts
  
  echo "✅ Created dist/native.d.ts barrel file"
else
  echo "❌ dist/native/index.d.ts is missing!"
  exit 1
fi

# Check exports in package.json
echo "Checking package.json exports..."
if grep -q "types.*native.d.ts" package.json; then
  echo "✅ Package exports properly configured for types"
else
  echo "❌ Package exports missing types configuration!"
  exit 1
fi

echo "✅ Build verification completed successfully"
echo "Ready to publish with: npm version patch && npm publish"
