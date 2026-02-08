#!/bin/bash
# Audio System Bootstrap Script
# This script triggers initial audio generation for the next 7 days

set -e

echo "==================================="
echo "Reawakened Audio Bootstrap"
echo "==================================="
echo ""

# Check if deployment is ready
echo "Checking if bootstrap endpoint is deployed..."
response=$(curl -s "https://reawakened.app/api/spark-audio/bootstrap?token=reawakened-2026-bootstrap")

if echo "$response" | grep -q "message"; then
  echo "✅ Bootstrap endpoint is live!"
  echo ""
  echo "Response: $response"
  echo ""
  echo "Audio generation has started in the background."
  echo "This will take approximately 7-10 minutes to complete."
  echo ""
  echo "Monitor progress:"
  echo "  flyctl logs --app reawakened-hub"
  echo ""
  echo "Or check status after 10 minutes:"
  echo "  curl https://reawakened.app/api/sparks/1399/audio"
  echo ""
else
  echo "❌ Bootstrap endpoint not deployed yet."
  echo ""
  echo "The server returned HTML instead of JSON."
  echo "This means the deployment hasn't completed."
  echo ""
  echo "Next steps:"
  echo "1. Check GitHub Actions: https://github.com/Dev1-Hebroux/Reawakened-Hub/actions"
  echo "2. Or manually deploy: flyctl deploy --remote-only --app reawakened-hub"
  echo "3. Then run this script again"
  echo ""
  exit 1
fi
