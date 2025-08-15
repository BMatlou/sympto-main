#!/bin/bash

PACKAGE_FILE="package.json"
VERCEL_FILE="vercel.json"

# Check if package.json exists
if [ ! -f "$PACKAGE_FILE" ]; then
  echo "Error: package.json not found!"
  exit 1
fi

# Backup package.json
cp $PACKAGE_FILE "${PACKAGE_FILE}.bak"
echo "Backup created: ${PACKAGE_FILE}.bak"

# Update scripts in package.json manually (skip jq if not installed)
echo "Please manually update your package.json scripts as follows:"
echo '{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}'

# Create vercel.json for SPA routing
cat > $VERCEL_FILE <<'JSON'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
JSON

echo "vercel.json created/updated for SPA routing."
echo "✅ Done! Redeploy your app to Vercel."
