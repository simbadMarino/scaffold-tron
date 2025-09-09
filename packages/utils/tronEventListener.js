const { TronWeb } = require("tronweb");
require('dotenv').config();
const fs = require('fs').promises;


// ========== CONFIGURATION ==========
const CONFIG = {
    // Network configurations
    networks: {
        mainnet: 'https://api.trongrid.io',
        nile: 'https://nile.trongrid.io',
        shasta: 'https://api.shasta.trongrid.io'
    },
    currentNetwork: process.env.TRON_NETWORK || 'nile',

    // Retry configuration
    retry: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffMultiplier: 2
    },

    // Polling configuration
    polling: {
        enabled: process.env.ENABLE_POLLING === 'true',
        intervalMs: parseInt(process.env.POLL_INTERVAL_MS) || 30000, // 30 seconds default
        maxRuns: parseInt(process.env.MAX_POLL_RUNS) || 10
    },

    // Event filtering
    eventFilters: {
        contractAddresses: process.env.CONTRACT_ADDRESSES ?
            process.env.CONTRACT_ADDRESSES.split(',').map(addr => addr.trim()) : [],
        eventNames: process.env.EVENT_NAMES ?
            process.env.EVENT_NAMES.split(',').map(name => name.trim()) : []
    }
};

// ========== ACCOUNTS ==========
const DELEGATOR_PK = process.env.DELEGATOR_PK;

// ========== INIT TRONWEB CLIENTS ==========
function createTronWeb() {
    const networkUrl = CONFIG.networks[CONFIG.currentNetwork];
    if (!networkUrl) {
        throw new Error(`Unknown network: ${CONFIG.currentNetwork}`);
    }

    return new TronWeb({
        fullHost: networkUrl,
        privateKey: DELEGATOR_PK
    });
}

// ========== UTILITY FUNCTIONS ==========
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry(fn, retryConfig = CONFIG.retry) {
    let lastError;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt}/${retryConfig.maxAttempts} failed:`, error.message);

            if (attempt < retryConfig.maxAttempts) {
                const delay = retryConfig.delayMs * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
                console.log(`Retrying in ${delay}ms...`);
                await sleep(delay);
            }
        }
    }

    throw new Error(`All ${retryConfig.maxAttempts} attempts failed. Last error: ${lastError.message}`);
}



function filterEvents(events, filters) {
    // Handle different response formats
    let eventArray = [];

    if (!events) {
        console.log('Events is null or undefined');
        return [];
    }

    //console.log('Raw events type:', typeof events);

    // Check if events is already an array
    if (Array.isArray(events)) {
        eventArray = events;
        console.log('Events is direct array, length:', eventArray.length);
    }
    // Check if events has a data property (common API response format)
    else if (events.data && Array.isArray(events.data)) {
        eventArray = events.data;
        // console.log('Events has data property, length:', eventArray.length);
    }
    // Check if events has an events property
    else if (events.events && Array.isArray(events.events)) {
        eventArray = events.events;
        console.log('Events has events property, length:', eventArray.length);
    }
    // Check if events has a result property
    else if (events.result && Array.isArray(events.result)) {
        eventArray = events.result;
        console.log('Events has result property, length:', eventArray.length);
    }
    // If it's a single event object, wrap it in an array
    else if (typeof events === 'object' && (events.contract_address || events.contractAddress || events.contract)) {
        eventArray = [events];
        console.log('Single event object converted to array');
    }
    else {
        console.warn('Unexpected events format:', typeof events);
        if (typeof events === 'object') {
            console.warn('Events structure keys:', Object.keys(events));
        }
        return [];
    }

    if (eventArray.length === 0) {
        console.log('No events in array');
        return eventArray;
    }

    //console.log(`Processing ${eventArray.length} events for filtering`);
    let filteredEvents = eventArray;

    // Filter by contract addresses - CORRECTED PROPERTY NAMES
    if (filters.contractAddresses.length > 0) {
        console.log('Filtering by contract addresses:', filters.contractAddresses);
        filteredEvents = filteredEvents.filter(event => {
            const eventContract = event.contract_address || event.contractAddress || event.contract || event.address;
            const eventResult = event.result;
            //console.log('Resource Pool contract:', eventContract);
            //console.log('Event Result:', eventResult);
            return filters.contractAddresses.includes(eventContract);
        });
        console.log(`Total number of retrieved events in contract: ${filteredEvents.length} events`);
    }

    // Filter by event names and return filtered events
    if (filters.eventNames.length > 0) {
        //console.log('Filtering by event names:', filters.eventNames);
        filteredEvents = filteredEvents.filter(event => {
            // TRON API uses 'event_name', not 'name'
            const eventName = event.event_name || event.name || event.eventName || event.event;
            //console.log('Event name:', eventName);
            return filters.eventNames.includes(eventName);
        });
        console.log(`Delegation Events: ${filteredEvents.length} events`);
    }

    return filteredEvents;
}

// Also update your formatEventOutput function to use correct property names:
function formatEventOutput(events, showDetails = true) {
    // Handle different response formats
    let eventArray = [];

    if (!events) {
        return 'No events found (null response)';
    }

    if (Array.isArray(events)) {
        eventArray = events;
    } else if (events.data && Array.isArray(events.data)) {
        eventArray = events.data;
    } else if (events.events && Array.isArray(events.events)) {
        eventArray = events.events;
    } else if (events.result && Array.isArray(events.result)) {
        eventArray = events.result;
    } else if (typeof events === 'object') {
        return `Raw response: ${JSON.stringify(events, null, 2)}`;
    }

    if (eventArray.length === 0) {
        return 'No events found in response';
    }

    const summary = `Found ${eventArray.length} event(s)`;

    if (!showDetails) {
        return summary;
    }

    const eventSummary = eventArray.reduce((acc, event) => {
        const contract = event.contract_address || event.contractAddress || event.contract || event.address || 'Unknown';
        const name = event.event_name || event.name || event.eventName || event.event || 'Unknown';
        const key = `${contract}:${name}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const summaryText = Object.entries(eventSummary)
        .map(([key, count]) => `  ${key}: ${count}`)
        .join('\n');

    return `${summary}\nEvent breakdown:\n${summaryText}`;
}

// ========== MAIN FUNCTIONS ==========
async function getLatestBlockEvents(tronWeb, showFullDetails = false) {
    try {
        console.log(`[${CONFIG.currentNetwork.toUpperCase()}] Fetching events from contract...`);

        const events = await withRetry(() => tronWeb.event.getEventsByContractAddress(process.env.CONTRACT_ADDRESSES, process.env.EVENT_NAMES));
        //console.log(events);
        const filteredEvents = filterEvents(events, CONFIG.eventFilters);

        //console.log(formatEventOutput(filteredEvents, !showFullDetails));


        const delegationDB = filteredEvents.reduce((acc, delegation) => {
            acc[delegation.result.timestamp] = {

                timestamp: delegation.result.timestamp,
                from: TronWeb.address.fromHex(delegation.result.caller),
                to: TronWeb.address.fromHex(delegation.result.delegateTo),
                amount: delegation.result.amount,
                resource: delegation.result.resourceType != 1 ? "Bandwidth" : "Energy",
                status: "active",

            };
            return acc;

        }, {});
        console.log(delegationDB);
        if (showFullDetails && filteredEvents && filteredEvents.length > 0) {
            console.log('\nFull event details:');
            console.log(JSON.stringify(filteredEvents, null, 2));
        }

        return filteredEvents;
    } catch (error) {
        console.error('Error fetching events:', error.message);
        throw error;
    }
}




async function startPolling(tronWeb) {
    console.log(`Starting event polling every ${CONFIG.polling.intervalMs}ms...`);
    console.log(`Max runs: ${CONFIG.polling.maxRuns}`);

    let runCount = 0;
    const startTime = Date.now();

    while (runCount < CONFIG.polling.maxRuns) {
        try {
            const timestamp = new Date().toISOString();
            console.log(`\n--- Poll ${runCount + 1}/${CONFIG.polling.maxRuns} at ${timestamp} ---`);

            await getLatestBlockEvents(tronWeb, false);
            runCount++;

            if (runCount < CONFIG.polling.maxRuns) {
                await sleep(CONFIG.polling.intervalMs);
            }
        } catch (error) {
            console.error('Polling error:', error.message);
            // Continue polling even if one attempt fails
            runCount++;
            await sleep(CONFIG.polling.intervalMs);
        }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\nPolling completed. Total time: ${totalTime.toFixed(2)}s`);
}

// Save to JSON file
async function saveUserDB(userDB) {
    await fs.writeFile('userDB.json', JSON.stringify(userDB, null, 2));
}

// ========== MAIN EXECUTION ==========
async function main() {
    try {
        // Validate configuration
        if (!DELEGATOR_PK) {
            throw new Error('DELEGATOR_PK not found in environment variables');
        }

        console.log(`Network: ${CONFIG.currentNetwork.toUpperCase()}`);
        console.log(`Node: ${CONFIG.networks[CONFIG.currentNetwork]}`);

        if (CONFIG.eventFilters.contractAddresses.length > 0) {
            console.log(`Contract filters: ${CONFIG.eventFilters.contractAddresses.join(', ')}`);
        }

        if (CONFIG.eventFilters.eventNames.length > 0) {
            console.log(`Event name filters: ${CONFIG.eventFilters.eventNames.join(', ')}`);
        }

        const tronWeb = createTronWeb();

        // Check if polling is enabled
        if (CONFIG.polling.enabled) {
            await startPolling(tronWeb);
        } else {
            // Single run
            await getLatestBlockEvents(tronWeb, false);
        }

    } catch (error) {
        console.error('Script failed:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Shutting down gracefully...');
    process.exit(0);
});

// Execute the script
main();