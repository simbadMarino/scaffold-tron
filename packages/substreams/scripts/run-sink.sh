#!/bin/bash

# TRON Substreams SQL Sink Runner
# This script runs the substreams SQL sink to stream TRON transaction data to PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting TRON Substreams SQL Sink${NC}"

# Check if required tools are installed
command -v substreams >/dev/null 2>&1 || { echo -e "${RED}❌ substreams CLI is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ docker is required but not installed.${NC}" >&2; exit 1; }

# Set default values
SUBSTREAMS_API_TOKEN=${SUBSTREAMS_API_TOKEN:-""}
CONTRACT_ADDRESS=${CONTRACT_ADDRESS:-""}
START_BLOCK=${START_BLOCK:-"0"}
STOP_BLOCK=${STOP_BLOCK:-""}
DATABASE_URL=${DATABASE_URL:-"postgresql://tron_user:tron_password@localhost:5432/tron_transactions"}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--contract)
      CONTRACT_ADDRESS="$2"
      shift 2
      ;;
    -s|--start-block)
      START_BLOCK="$2"
      shift 2
      ;;
    -e|--end-block)
      STOP_BLOCK="$2"
      shift 2
      ;;
    -t|--token)
      SUBSTREAMS_API_TOKEN="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -c, --contract      Contract address to filter by"
      echo "  -s, --start-block   Start block number (default: 0)"
      echo "  -e, --end-block     End block number (default: live)"
      echo "  -t, --token         Substreams API token"
      echo "  -h, --help          Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Check if API token is provided
if [[ -z "$SUBSTREAMS_API_TOKEN" ]]; then
  echo -e "${RED}❌ SUBSTREAMS_API_TOKEN environment variable is required${NC}"
  echo "Get your token from: https://app.streamingfast.io/"
  exit 1
fi

# Start PostgreSQL and PostGraphile
echo -e "${YELLOW}📦 Starting PostgreSQL and PostGraphile...${NC}"
docker compose up -d postgres postgraphile

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 10

# Build the substreams parameters
PARAMS=""
if [[ -n "$CONTRACT_ADDRESS" ]]; then
  PARAMS="contract_address:$CONTRACT_ADDRESS"
  echo -e "${GREEN}🔍 Filtering by contract address: $CONTRACT_ADDRESS${NC}"
else
  PARAMS="contract_type:TransferContract"
  echo -e "${GREEN}🔍 Using default filter: TransferContract${NC}"
fi

# Build the substreams command
SUBSTREAMS_CMD="substreams-sink-sql run"
SUBSTREAMS_CMD="$SUBSTREAMS_CMD --endpoint mainnet.tron.streamingfast.io:443"
SUBSTREAMS_CMD="$SUBSTREAMS_CMD -p filtered_transactions=$PARAMS"
SUBSTREAMS_CMD="$SUBSTREAMS_CMD $DATABASE_URL"
SUBSTREAMS_CMD="$SUBSTREAMS_CMD substreams.yaml"

if [[ -n "$STOP_BLOCK" ]]; then
  SUBSTREAMS_CMD="$SUBSTREAMS_CMD $START_BLOCK:$STOP_BLOCK"
else
  SUBSTREAMS_CMD="$SUBSTREAMS_CMD $START_BLOCK"
fi

echo -e "${GREEN}🌊 Starting substreams with parameters: $PARAMS${NC}"
echo -e "${YELLOW}📡 Connecting to TRON mainnet...${NC}"
echo -e "${YELLOW}🔄 Streaming transaction data to PostgreSQL...${NC}"

# Export the database URL and API token
export DATABASE_URL="$DATABASE_URL"
export SUBSTREAMS_API_TOKEN="$SUBSTREAMS_API_TOKEN"

# Run the substreams command
echo -e "${GREEN}▶️  Running: $SUBSTREAMS_CMD${NC}"
eval $SUBSTREAMS_CMD

echo -e "${GREEN}✅ Substreams SQL sink completed!${NC}"
echo -e "${GREEN}📊 GraphQL endpoint available at: http://localhost:5001/graphiql${NC}" 