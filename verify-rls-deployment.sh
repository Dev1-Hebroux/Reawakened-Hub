#!/bin/bash

# RLS Deployment Verification Script
# Run this after deployment to verify RLS is working correctly

set -e

export FLYCTL_INSTALL="/Users/hebrouxconsulting/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   RLS Deployment Verification${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo ""

# Check deployment status
echo -e "${YELLOW}1. Checking deployment status...${NC}"
flyctl status -a reawakened-hub
echo ""

# Check indexes
echo -e "${YELLOW}2. Verifying indexes...${NC}"
INDEX_COUNT=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT COUNT(*) FROM pg_indexes WHERE schemaname = '\''public'\'' AND indexname LIKE '\''idx_%'\'''" 2>/dev/null | tr -d ' \n')
echo -e "${GREEN}✓ Total indexes: $INDEX_COUNT${NC}"
echo ""

# Check RLS enabled tables
echo -e "${YELLOW}3. Verifying RLS enabled tables...${NC}"
RLS_TABLES=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT tablename FROM pg_tables WHERE schemaname = '\''public'\'' AND rowsecurity = true'" 2>/dev/null)
RLS_COUNT=$(echo "$RLS_TABLES" | grep -v '^$' | wc -l | tr -d ' ')
echo -e "${GREEN}✓ Tables with RLS enabled: $RLS_COUNT${NC}"
echo "Tables:"
echo "$RLS_TABLES"
echo ""

# Check FORCED RLS
echo -e "${YELLOW}4. Verifying FORCED RLS...${NC}"
FORCED_COUNT=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT COUNT(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = '\''public'\'' AND c.relrowsecurity = true AND c.relforcerowsecurity = true'" 2>/dev/null | tr -d ' \n')
echo -e "${GREEN}✓ Tables with FORCED RLS: $FORCED_COUNT${NC}"
echo ""

# Check policies
echo -e "${YELLOW}5. Verifying RLS policies...${NC}"
POLICY_COUNT=$(flyctl ssh console -a reawakened-hub -C "psql \$DATABASE_URL -t -c 'SELECT COUNT(*) FROM pg_policies'" 2>/dev/null | tr -d ' \n')
echo -e "${GREEN}✓ Total policies: $POLICY_COUNT${NC}"
echo ""

# Test a sample query (check if app is responding)
echo -e "${YELLOW}6. Testing application health...${NC}"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://reawakened-hub.fly.dev/api/health || echo "000")
if [ "$HEALTH_CHECK" = "200" ]; then
  echo -e "${GREEN}✓ Application is responding (HTTP 200)${NC}"
else
  echo -e "${RED}⚠ Application health check returned: $HEALTH_CHECK${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Verification Complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Summary:"
echo "  - Indexes:        $INDEX_COUNT"
echo "  - RLS Tables:     $RLS_COUNT"
echo "  - Forced RLS:     $FORCED_COUNT"
echo "  - Policies:       $POLICY_COUNT"
echo "  - Health Check:   $HEALTH_CHECK"
echo ""

if [ "$RLS_COUNT" -ge "17" ] && [ "$POLICY_COUNT" -ge "30" ] && [ "$FORCED_COUNT" -ge "17" ]; then
  echo -e "${GREEN}✨ All checks passed! RLS is properly configured.${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠ Some checks failed. Please review the output above.${NC}"
  exit 1
fi
