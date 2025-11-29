export STREAMINGFAST_KEY="YOUR_STREAMINGFAST_API_KEY"

function sftoken {
export SUBSTREAMS_API_TOKEN=$(curl https://auth.streamingfast.io/v1/auth/issue -s 
--data-binary '{"api_key":"'$STREAMINGFAST_KEY'"}' | jq -r .token)
echo "Token set in SUBSTREAMS_API_TOKEN"
}
sftoken