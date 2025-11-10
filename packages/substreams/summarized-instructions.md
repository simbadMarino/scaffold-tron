A) One-time setup

Clone & enter the Substreams package

git clone https://github.com/aziz1975/scaffold-tron
cd scaffold-tron/packages/substreams


Install Substreams CLI (any one way works)

Homebrew (macOS): brew install streamingfast/tap/substreams 
GitHub

Or use their Docker image (alias):

Auth with StreamingFast 

export STREAMINGFAST_KEY="YOUR_STREAMINGFAST_API_KEY"

function sftoken {
  export SUBSTREAMS_API_TOKEN=$(curl https://auth.streamingfast.io/v1/auth/issue -s \
    --data-binary '{"api_key":"'$STREAMINGFAST_KEY'"}' | jq -r .token)
  echo "Token set in SUBSTREAMS_API_TOKEN"
}
sftoken


Start the Postgres + PostGraphile stack

# from scaffold-tron/packages/substreams
docker-compose up -d
docker ps   # you should see substreams-postgres-1 and substreams-postgraphile-1


(Recommended) Download the TRON Foundational package once

# still in packages/substreams
mkdir -p bin
substreams pack tron-foundational@v0.1.2 -o bin/tron-foundational-v0.1.2.spkg
substreams info bin/tron-foundational-v0.1.2.spkg


Package overview (what modules exist) is also on the package page. 
substreams.dev

B) Quick “it works” demo (streams → DB)

Option 1 — Yarn helpers (fast path)
# from repo root OR packages/substreams
# Clean DB (optional)
yarn substreams:cleandb

# Stream (demo — smaller range)
yarn substreams:demo

# Or fuller stream
yarn substreams:streamdb


These call substreams run … | node scripts/stream-direct-to-db.js under the hood. 

Option 2 — Raw CLI → Node script (explicit)
# still in packages/substreams
substreams run ./bin/tron-foundational-v0.1.2.spkg map_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s 55000200 -t +100 \
| node scripts/stream-direct-to-db.js


Check data landed

docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c \
"SELECT COUNT(*) FROM tron_transactions;"


C) Targeted capture (only the events you care about)

You asked for USDT transfers (TRC-20) to a specific address. Use the filtered_transactions module and pass a server-side filter in the param string, then pipe into the DB writer.

Variables (TRON mainnet Base58):

USDT contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

Your address: TWtfUYRLfA4b61eJ3wwHmYcieV14rUTMCW

Run (server-side filter on TRON mainnet):

# from packages/substreams
sftoken   # refresh token if needed

substreams run ./bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1 -t +0 \
  -p filtered_transactions:"(contract_type:TriggerSmartContract && contract_address:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t && to:TWtfUYRLfA4b61eJ3wwHmYcieV14rUTMCW)" \
  -o jsonl \
| node scripts/stream-direct-to-db.js


TRON Foundational package listing confirms the available modules we’re calling. 
substreams.dev


node scripts/stream-to-db.js
# or restrict to a contract:
FILTER_CONTRACT="0x41a614f803b6fd780986a42c78ec9c7f77e6ded13c" node scripts/stream-to-db.js


D) Verify / Observe

SQL:

docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c \
"\d tron_transactions"
docker exec -it substreams-postgres-1 psql -U tron_user -d tron_transactions -c \
"SELECT block_number, transaction_hash, contract_address, from_address, to_address, value
 FROM tron_transactions ORDER BY block_number DESC LIMIT 10;"


GraphQL:

curl http://localhost:5001/graphql -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { name } } }"}'


(Validates PostGraphile is up.

E) Common pitfalls (fast fixes)

No data / unauthorized → refresh token with sftoken (sets SUBSTREAMS_API_TOKEN) before running substreams run. 

Wrong endpoint → for TRON (native), use mainnet.tron.streamingfast.io:443 

DB errors → use the provided docker-compose from this folder so the schema & PostGraphile provision automatically; docker-compose down -v && up -d to reset. 
GitHub

Filter too strict → first test with only contract_address:… then add to:… if needed.

TL;DR runbook
cd scaffold-tron/packages/substreams
export STREAMINGFAST_KEY=...; sftoken
docker-compose up -d

# download package once
substreams pack tron-foundational@v0.1.2 -o bin/tron-foundational-v0.1.2.spkg

# USDT → your address → DB
substreams run ./bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1 -t +0 \
  -p filtered_transactions:"(contract_type:TriggerSmartContract && contract_address:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t && to:TWtfUYRLfA4b61eJ3wwHmYcieV14rUTMCW)" \
  -o jsonl \
| node scripts/stream-direct-to-db.js


Everything above is straight from the packages/substreams section of your README: the auth, package download, docker compose, the CLI examples, the yarn shortcuts, and the scripts to push rows into Postgres

Example command for "from":
substreams run ./bin/tron-foundational-v0.1.2.spkg filtered_transactions \
  -e mainnet.tron.streamingfast.io:443 \
  -s -1 \
  -p 'filtered_transactions=contract_type:TriggerSmartContract && contract_address:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t && from:TLj5jNLzaoR94c5WUH9uxpQAY3RZT6gh2y' \
  -o jsonl \
| node --max-old-space-size=8192 --expose-gc scripts/store-filtered-to-table.js


Example command for "to":
substreams run -e mainnet-evm.tron.streamingfast.io:443   ethereum-common@v0.3.3 filtered_events   -s -1   -p 'filtered_events=evt_addr:0xa614f803b6fd780986a42c78ec9c7f77e6ded13c && evt_sig:0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'   -o jsonl | node --max-old-space-size=8192 --expose-gc scripts/store-filtered-to-table-credit.js TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf
