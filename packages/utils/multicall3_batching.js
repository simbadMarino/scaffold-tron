require('dotenv').config();
const { TronWeb } = require('tronweb');

const Web3pkg = require('web3');
const Web3 = Web3pkg.default || Web3pkg;
const web3 = new Web3();

// ───────── env / client ─────────
const FULL_HOST = process.env.FULL_HOST || 'https://api.trongrid.io';
const TRON_GRID_KEY = process.env.TRON_GRID_KEY || '';
const MULTICALL3_T_ADDR = process.env.MULTICALL3_T_ADDR || 'TEazPvZwDjDtFeJupyo7QunvnrnUjPH8ED';
const CALLER_T_ADDR = process.env.CALLER_T_ADDR || MULTICALL3_T_ADDR; // T-address

if (!TronWeb.isAddress(MULTICALL3_T_ADDR)) throw new Error('Bad MULTICALL3_T_ADDR');
if (!TronWeb.isAddress(CALLER_T_ADDR)) throw new Error('Bad CALLER_T_ADDR');

const tronWeb = new TronWeb({
    fullHost: FULL_HOST,
    headers: TRON_GRID_KEY ? { 'TRON-PRO-API-KEY': TRON_GRID_KEY } : undefined,
    eventHeaders: TRON_GRID_KEY ? { 'TRON-PRO-API-KEY': TRON_GRID_KEY } : undefined,
});

// ───────── selectors (Web3) ─────────
const SELECTORS = {
    // ERC-20 metadata
    name: web3.eth.abi.encodeFunctionSignature({ name: 'name', type: 'function', inputs: [] }),
    symbol: web3.eth.abi.encodeFunctionSignature({ name: 'symbol', type: 'function', inputs: [] }),
    decimals: web3.eth.abi.encodeFunctionSignature({ name: 'decimals', type: 'function', inputs: [] }),
    totalSupply: web3.eth.abi.encodeFunctionSignature({ name: 'totalSupply', type: 'function', inputs: [] }),
};

const CHAIN_SELECTORS = {
    getChainId: web3.eth.abi.encodeFunctionSignature({ name: 'getChainId', type: 'function', inputs: [] }),
    getBlockNumber: web3.eth.abi.encodeFunctionSignature({ name: 'getBlockNumber', type: 'function', inputs: [] }),
    getCurrentBlockTimestamp: web3.eth.abi.encodeFunctionSignature({ name: 'getCurrentBlockTimestamp', type: 'function', inputs: [] }),
    // We can add more here if needed:
    // getLastBlockHash:         web3.eth.abi.encodeFunctionSignature({ name:'getLastBlockHash', type:'function', inputs:[] }),
    // getBasefee:               web3.eth.abi.encodeFunctionSignature({ name:'getBasefee',       type:'function', inputs:[] }),
};

// ───────── Multicall3 ABIs (override to "view" so .call() works) ─────────
const ABI_TRY_AGG = [{
    name: 'tryAggregate',
    type: 'function',
    stateMutability: 'view',
    inputs: [
        { name: 'requireSuccess', type: 'bool' },
        {
            name: 'calls', type: 'tuple[]', components: [
                { name: 'target', type: 'address' }, // pass T-address here
                { name: 'callData', type: 'bytes' },
            ]
        }
    ],
    outputs: [{
        name: 'returnData', type: 'tuple[]', components: [
            { name: 'success', type: 'bool' },
            { name: 'returnData', type: 'bytes' },
        ]
    }]
}];

const ABI_AGG3 = [{
    name: 'aggregate3',
    type: 'function',
    stateMutability: 'view',
    inputs: [{
        name: 'calls', type: 'tuple[]', components: [
            { name: 'target', type: 'address' }, // pass T-address
            { name: 'allowFailure', type: 'bool' },
            { name: 'callData', type: 'bytes' },
        ]
    }],
    outputs: [{
        name: 'returnData', type: 'tuple[]', components: [
            { name: 'success', type: 'bool' },
            { name: 'returnData', type: 'bytes' },
        ]
    }]
}];

// Direct-call ABI for Multicall3 helper getters (optional fallback)
const ABI_CHAIN_HELPERS = [
    { name: 'getChainId', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256', name: 'chainid' }] },
    { name: 'getBlockNumber', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256', name: 'blockNumber' }] },
    { name: 'getCurrentBlockTimestamp', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256', name: 'timestamp' }] },
];

// ───────── decoders for inner bytes ─────────
function decodeString(hex) {
    try { const s = web3.eth.abi.decodeParameter('string', hex); if (s) return s; } catch { }
    try {
        const b32 = web3.eth.abi.decodeParameter('bytes32', hex);
        const buf = Buffer.from(b32.replace(/^0x/, ''), 'hex');
        return buf.toString('utf8').replace(/\u0000+$/g, '').trim();
    } catch { }
    return '';
}

function decodeUint(hex, type = 'uint256') {
    try { return web3.eth.abi.decodeParameter(type, hex).toString(); }
    catch { return web3.eth.abi.decodeParameter('uint256', hex).toString(); }
}

// ───────── normalize shapes TronWeb may return ─────────
function normalizeResult(result) {
    // Common shapes:
    // 1) [{success, returnData}, ...]
    // 2) { returnData: [ {success, returnData}, ... ] }
    // 3) [ [success, returnData], ... ]
    // 4) [ [ [success, returnData], ... ] ]  <-- extra nesting sometimes
    let arr = Array.isArray(result) ? result : (result && result.returnData) || result;
    if (!Array.isArray(arr)) throw new Error('Unexpected Multicall3 return shape');

    // Unwrap one extra nesting if present
    if (arr.length === 1 && Array.isArray(arr[0]) && (arr[0].length > 0)) {
        arr = arr[0];
    }

    // Map entries to uniform objects {success, returnData}
    return arr.map(item => {
        if (Array.isArray(item)) return { success: !!item[0], returnData: item[1] };
        return { success: !!item.success, returnData: item.returnData };
    });
}

// ───────── call helpers: ERC-20 metadata via tryAggregate / aggregate3 ─────────
async function callTryAggregate(tokens) {
    const methods = ['name', 'symbol', 'decimals', 'totalSupply'];
    const calls = [];
    for (const t of tokens) {
        if (!TronWeb.isAddress(t)) throw new Error(`Bad token T-address: ${t}`);
        for (const m of methods) calls.push([t, SELECTORS[m]]); // [T-address, bytes]
    }
    const mc = await tronWeb.contract(ABI_TRY_AGG, MULTICALL3_T_ADDR);
    const raw = await mc.tryAggregate(false, calls).call({ from: CALLER_T_ADDR });
    return normalizeResult(raw);
}

async function callAggregate3(tokens) {
    const methods = ['name', 'symbol', 'decimals', 'totalSupply'];
    const calls = [];
    for (const t of tokens) {
        if (!TronWeb.isAddress(t)) throw new Error(`Bad token T-address: ${t}`);
        for (const m of methods) calls.push([t, true, SELECTORS[m]]); // [T-address, bool, bytes]
    }
    const mc = await tronWeb.contract(ABI_AGG3, MULTICALL3_T_ADDR);
    const raw = await mc.aggregate3(calls).call({ from: CALLER_T_ADDR });
    return normalizeResult(raw);
}

// ───────── NEW: chain info via Multicall3 ─────────
// Preferred: batch these three getters through tryAggregate (target = Multicall3)
async function fetchChainInfoViaTryAggregate() {
    const calls = [
        [MULTICALL3_T_ADDR, CHAIN_SELECTORS.getChainId],
        [MULTICALL3_T_ADDR, CHAIN_SELECTORS.getBlockNumber],
        [MULTICALL3_T_ADDR, CHAIN_SELECTORS.getCurrentBlockTimestamp],
    ];
    const mc = await tronWeb.contract(ABI_TRY_AGG, MULTICALL3_T_ADDR);
    const raw = await mc.tryAggregate(false, calls).call({ from: CALLER_T_ADDR });
    const arr = normalizeResult(raw);
    if (arr.length !== 3) throw new Error(`Unexpected chain-info results length: got ${arr.length}, expected 3`);

    const chainId = arr[0].success ? Number(decodeUint(arr[0].returnData)) : null;
    const blockNum = arr[1].success ? Number(decodeUint(arr[1].returnData)) : null;
    const timestamp = arr[2].success ? Number(decodeUint(arr[2].returnData)) : null;

    return { chainId, blockNumber: blockNum, timestamp, via: 'tryAggregate' };
}

// Fallback: direct .call() on Multicall3 getters
async function fetchChainInfoDirect() {
    const mc = await tronWeb.contract(ABI_CHAIN_HELPERS, MULTICALL3_T_ADDR);
    const [chainId, blockNumber, timestamp] = await Promise.all([
        mc.getChainId().call({ from: CALLER_T_ADDR }),
        mc.getBlockNumber().call({ from: CALLER_T_ADDR }),
        mc.getCurrentBlockTimestamp().call({ from: CALLER_T_ADDR }),
    ]);
    // TronWeb generally returns strings for uints; make them numbers (safe ranges here)
    return {
        chainId: Number(chainId),
        blockNumber: Number(blockNumber),
        timestamp: Number(timestamp),
        via: 'direct',
    };
}

// ───────── public API ─────────
async function fetchMetadataBatch(tokens) {
    const expected = tokens.length * 4;

    // Try tryAggregate first
    let arr = await callTryAggregate(tokens);
    if (arr.length !== expected) {
        // fallback to aggregate3
        arr = await callAggregate3(tokens);
    }
    if (arr.length !== expected) {
        throw new Error(`Unexpected results length: got ${arr.length}, expected ${expected}`);
    }

    const out = [];
    for (let i = 0; i < tokens.length; i++) {
        const base = i * 4;
        const rName = arr[base + 0];
        const rSym = arr[base + 1];
        const rDec = arr[base + 2];
        const rSup = arr[base + 3];

        const name = rName.success ? decodeString(rName.returnData) : '';
        const symbol = rSym.success ? decodeString(rSym.returnData) : '';
        const decimals = rDec.success ? Number(decodeUint(rDec.returnData, 'uint8')) : null;
        const totalSupply = rSup.success ? decodeUint(rSup.returnData, 'uint256') : null;

        out.push({
            token: tokens[i],
            success: rName.success && rSym.success && rDec.success && rSup.success,
            name, symbol, decimals, totalSupply
        });
    }
    return out;
}

// ───────── runner ─────────
(async () => {
    // Example tokens
    const TOKENS = [
        'TNo59Khpq46FGf4sD7XSWYFNfYfbc8CqNK',
        'TDyvndWuvX5xTBwHPYJi7J3Yq8pq8yh62h',
    ];

    // 1) Chain info via aggregated call (with direct-call fallback)
    let chainInfo;
    try {
        chainInfo = await fetchChainInfoViaTryAggregate();
    } catch (e) {
        chainInfo = await fetchChainInfoDirect();
    }
    console.log('Chain Info:', chainInfo);

    // 2) ERC-20 metadata in chunks
    const CHUNK = 50;
    const results = [];
    for (let i = 0; i < TOKENS.length; i += CHUNK) {
        const slice = TOKENS.slice(i, i + CHUNK);
        const part = await fetchMetadataBatch(slice);
        results.push(...part);
        await new Promise(r => setTimeout(r, 200));
    }

    console.table(results);
})().catch(e => {
    console.error(e);
    process.exit(1);
});