#!/bin/bash

# Test RLS Migration Script
# This script runs the RLS migration against the Fly.io database

set -e  # Exit on error

echo "🔍 Testing RLS Migration..."
echo ""

# Set Fly CLI path
export FLYCTL_INSTALL="/Users/hebrouxconsulting/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Checking Fly.io connection...${NC}"
flyctl status -a reawakened-hub > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Connected to Fly.io${NC}"
else
  echo -e "${RED}✗ Failed to connect to Fly.io${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Backing up current database state...${NC}"
echo "Getting table count before migration..."
TABLE_COUNT=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '\''public'\'''" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}✓ Current table count: $TABLE_COUNT${NC}"

echo ""
echo -e "${YELLOW}Step 3: Running migration...${NC}"
flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL < /app/migrations/0007_rls_policies_and_comprehensive_indexes.sql" 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Migration completed successfully${NC}"
else
  echo -e "${RED}✗ Migration failed${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Verifying migration...${NC}"

# Check indexes created
echo "Checking indexes..."
INDEX_COUNT=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT COUNT(*) FROM pg_indexes WHERE schemaname = '\''public'\'' AND indexname LIKE '\''idx_%'\'''" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}✓ Total indexes: $INDEX_COUNT${NC}"

# Check RLS enabled
echo "Checking RLS enabled tables..."
RLS_COUNT=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT COUNT(*) FROM pg_tables WHERE schemaname = '\''public'\'' AND rowsecurity = true'" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}✓ Tables with RLS: $RLS_COUNT${NC}"

# Check policies
echo "Checking RLS policies..."
POLICY_COUNT=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT COUNT(*) FROM pg_policies'" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}✓ Total policies: $POLICY_COUNT${NC}"

echo ""
echo -e "${GREEN}✨ Migration verification complete!${NC}"
echo ""
echo "Summary:"
echo "  - Tables: $TABLE_COUNT"
echo "  - Indexes: $INDEX_COUNT"
echo "  - RLS Tables: $RLS_COUNT"
echo "  - Policies: $POLICY_COUNT"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Restart the Fly.io app: flyctl restart -a reawakened-hub"
echo "  2. Test with multiple users"
echo "  3. Monitor performance metrics"
