#!/usr/bin/env node

/**
 * Reads JSONL from stdin (Substreams `filtered_transactions` on TRON-native)
 * and inserts rows into `filtered_usdt_transactions`, decoding TRC-20 calls.
 *
 * - Handles base64 vs hex for TriggerSmartContract.parameter.data
 * - Decodes transfer/transferFrom selectors to get {to_address, amount}
 * - Falls back to "Transfer" events if present
 * - Creates the table if missing
 */

const { Client } = require("pg");
const crypto = require("crypto");

// ---------- Config ----------
const TABLE = "filtered_usdt_transactions";
const db = new Client({
  host: "localhost",
  port: 5437,
  database: "tron_transactions",
  user: "tron_user",
  password: "tron_password",
});

// ---------- Base58 helpers ----------
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(buffer) {
  if (buffer.length === 0) return "";
  let digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let zeros = 0;
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) zeros++;
  let out = "";
  for (let i = 0; i < zeros; i++) out += BASE58_ALPHABET[0];
  for (let i = digits.length - 1; i >= 0; i--) out += BASE58_ALPHABET[digits[i]];
  return out;
}

function tronBytesToBase58(bytes) {
  const hash1 = crypto.createHash("sha256").update(bytes).digest();
  const hash2 = crypto.createHash("sha256").update(hash1).digest();
  const checksum = hash2.slice(0, 4);
  return base58Encode(Buffer.concat([bytes, checksum]));
}

// EVM 20-byte hex => TRON Base58 (0x41 + 20 bytes + checksum)
function evmHex20ToTronBase58(hex) {
  if (!hex) return null;
  const h = hex.toLowerCase().replace(/^0x/, "");
  if (h.length !== 40) return null;
  const tron21 = Buffer.concat([Buffer.from([0x41]), Buffer.from(h, "hex")]);
  return tronBytesToBase58(tron21);
}

// Accepts base64/hex/Buffer and returns TRON Base58
function tronAddressToBase58(addressBytes) {
  try {
    let bytes;
    if (typeof addressBytes === "string") {
      try { bytes = Buffer.from(addressBytes, "base64"); }
      catch { bytes = Buffer.from(addressBytes.replace(/^0x/, ""), "hex"); }
    } else if (Buffer.isBuffer(addressBytes)) {
      bytes = addressBytes;
    } else if (addressBytes instanceof Uint8Array) {
      bytes = Buffer.from(addressBytes);
    } else {
      return null;
    }
    if (bytes.length === 20) bytes = Buffer.concat([Buffer.from([0x41]), bytes]);
    return tronBytesToBase58(bytes);
  } catch { return null; }
}

// ---------- Extractors ----------
function extractFromAddress(tx) {
  const raw = tx.fromAddress || tx.contracts?.[0]?.parameter?.ownerAddress || null;
  return raw ? tronAddressToBase58(raw) : null;
}

function extractContractAddress(tx) {
  const raw =
    tx.contracts?.[0]?.parameter?.contractAddress ||
    tx.info?.contractAddress ||
    tx.contractAddress ||
    null;
  return raw ? tronAddressToBase58(raw) : null;
}

function hexToDecimal(hexString) {
  if (!hexString || hexString === "0x" || hexString === "0x0") return "0";
  try { return BigInt(hexString).toString(); } catch { return "0"; }
}

// ---------- TRC-20 calldata handling ----------

// Pull TriggerSmartContract.parameter.data and return "0x..." hex (handles base64 vs hex)
function extractCallDataHex(tx) {
  const c0 = tx.contracts && tx.contracts[0];
  if (!c0 || c0.type !== "TriggerSmartContract") return null;

  const raw = c0.parameter?.data || c0.parameter?.value?.data;
  if (!raw || typeof raw !== "string") return null;

  const looksHex = /^[0-9a-fA-F]+$/.test(raw.replace(/^0x/, ""));
  if (raw.startsWith("0x") || looksHex) return raw.startsWith("0x") ? raw : "0x" + raw;

  // base64 → hex
  try {
    const buf = Buffer.from(raw, "base64");
    return "0x" + buf.toString("hex");
  } catch { return null; }
}

// Decode a TRON address from a 32-byte ABI slot (64 hex chars)
function decodeTronAddressFromSlotHex(slotHex) {
  if (!slotHex || slotHex.length !== 64) return null;
  const s = slotHex.toLowerCase();

  // last 21 bytes (0x41 + 20) => 42 hex chars
  const last42 = s.slice(-42);
  if (last42.startsWith("41")) {
    const bytes21 = Buffer.from(last42, "hex");
    return tronBytesToBase58(bytes21);
  }

  // else fall back to the last 20 bytes as EVM address
  const last40 = s.slice(-40);
  return evmHex20ToTronBase58("0x" + last40);
}

/**
 * Parse ERC20-style calldata:
 *  - transfer(address,uint256) -> a9059cbb
 *  - transferFrom(address,address,uint256) -> 23b872dd
 * Returns slot hex for from/to so we can decode TRON address properly.
 */
function parseTrc20CallData(hex) {
  if (!hex) return null;
  let data = hex.toLowerCase();
  if (!data.startsWith("0x")) data = "0x" + data;
  if (data.length < 10) return null;

  const sel = data.slice(2, 10);
  const payload = data.slice(10);
  const slot = (n) => payload.slice(n * 64, (n + 1) * 64);

  if (sel === "a9059cbb") { // transfer(address,uint256)
    const toSlotHex = slot(0);
    const amtSlot   = slot(1);
    const amount    = BigInt("0x" + amtSlot).toString();
    return { selector: sel, toSlotHex, fromSlotHex: null, amount };
  }

  if (sel === "23b872dd") { // transferFrom(address,address,uint256)
    const fromSlotHex = slot(0);
    const toSlotHex   = slot(1);
    const amtSlot     = slot(2);
    const amount      = BigInt("0x" + amtSlot).toString();
    return { selector: sel, fromSlotHex, toSlotHex, amount };
  }

  return null;
}

// Fallback via events (if present on TRON native payloads)
function extractFromEvents(tx) {
  const evs = tx.events || tx.eventList || [];
  for (const ev of evs) {
    const name = (ev.name || ev.event_name || ev.event || "").toString();
    if (name !== "Transfer") continue;

    const params = ev.parameters || ev.params || ev.args || [];
    const list = Array.isArray(params)
      ? params.map((p, i) => ({ name: (p.name || p.key || `p${i}`).toString(), value: (p.value ?? p).toString() }))
      : Object.entries(params).map(([k, v]) => ({ name: k.toString(), value: (v ?? "").toString() }));

    const toP = list.find(p => p.name.toLowerCase() === "to");
    const val = list.find(p => ["value", "amount"].includes(p.name.toLowerCase())) || list[2];

    const toB58 = toP?.value ? tronAddressToBase58(toP.value) : null;
    const amount = (val?.value || "0").toString();
    if (toB58) return { toB58, amount };
  }
  return null;
}

// ---------- Insert ----------
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id               BIGSERIAL PRIMARY KEY,
      module_name      VARCHAR(64)  NOT NULL,
      block_id         CHAR(64)     NOT NULL,
      block_number     BIGINT       NOT NULL,
      block_timestamp  TIMESTAMPTZ  NOT NULL,
      tx_hash          CHAR(64)     NOT NULL,
      contract_type    VARCHAR(32)  NOT NULL,
      contract_address VARCHAR(35)  NOT NULL,
      from_address     VARCHAR(35),
      to_address       VARCHAR(35),
      amount           NUMERIC(38,0) DEFAULT 0,
      fee              NUMERIC(38,0) DEFAULT 0,
      result           VARCHAR(32)   DEFAULT 'SUCCESS',
      raw_data         JSONB         NOT NULL,
      CONSTRAINT uq_filtered_tx UNIQUE (tx_hash)
    );
    CREATE INDEX IF NOT EXISTS idx_fusdt_block_number     ON ${TABLE} (block_number);
    CREATE INDEX IF NOT EXISTS idx_fusdt_contract_address ON ${TABLE} (contract_address);
    CREATE INDEX IF NOT EXISTS idx_fusdt_to_address       ON ${TABLE} (to_address);
    CREATE INDEX IF NOT EXISTS idx_fusdt_from_address     ON ${TABLE} (from_address);
  `);
}

async function insertRow(clock, moduleName, tx) {
  // Decode TRC-20 call data first
  const callHex = extractCallDataHex(tx);
  const dec = parseTrc20CallData(callHex);

  const blockId = clock?.id || "";
  const blockNum = Number(clock?.number || 0);
  const blockTs = clock?.timestamp ? new Date(clock.timestamp) : new Date();

  const txHash = tx.hash || tx.txid || "";
  let fromB58 = extractFromAddress(tx);
  const ctype = tx.contracts?.[0]?.type || tx.contractType || "";
  const caddrB58 = extractContractAddress(tx);

  let toB58 = "";
  let amountRaw = "0";

  if (dec) {
    if (dec.toSlotHex) {
      const b58 = decodeTronAddressFromSlotHex(dec.toSlotHex);
      if (b58) toB58 = b58;
    }
    if (!fromB58 && dec.fromSlotHex) {
      const bf = decodeTronAddressFromSlotHex(dec.fromSlotHex);
      if (bf) fromB58 = bf;
    }
    amountRaw = dec.amount || "0";
  } else {
    // Fallback: events
    const ev = extractFromEvents(tx);
    if (ev) {
      toB58 = ev.toB58 || "";
      amountRaw = ev.amount || "0";
    } else {
      // Final fallbacks (rare for TRC-20)
      const maybeTo = tx.toAddress || tx.contracts?.[0]?.parameter?.toAddress || null;
      toB58 = maybeTo ? tronAddressToBase58(maybeTo) || "" : "";
      if (tx.value) amountRaw = hexToDecimal(tx.value);
      const c = tx.contracts?.[0];
      if (c?.parameter?.amount && (c.type === "TransferContract" || c.type === "TransferAssetContract")) {
        amountRaw = String(c.parameter.amount);
      }
    }
  }

  const feeRaw = hexToDecimal(tx.fee) || "0";
  const result = tx.result || tx.ret?.[0]?.contractRet || "SUCCESS";

  const q = `
    INSERT INTO ${TABLE} (
      module_name, block_id, block_number, block_timestamp,
      tx_hash, contract_type, contract_address, from_address, to_address,
      amount, fee, result, raw_data
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (tx_hash) DO UPDATE SET
      block_number = EXCLUDED.block_number,
      block_timestamp = EXCLUDED.block_timestamp,
      contract_type = EXCLUDED.contract_type,
      contract_address = EXCLUDED.contract_address,
      from_address = EXCLUDED.from_address,
      to_address   = EXCLUDED.to_address,
      amount       = EXCLUDED.amount,
      fee          = EXCLUDED.fee,
      result       = EXCLUDED.result,
      raw_data     = EXCLUDED.raw_data
  `;

  const vals = [
    moduleName || "filtered_transactions",
    blockId,
    blockNum,
    blockTs,
    txHash,
    ctype,
    caddrB58 || "",
    fromB58 || "",
    toB58 || "",
    amountRaw,
    feeRaw,
    result,
    JSON.stringify(tx),
  ];

  await db.query(q, vals);
}

// ---------- Stream JSONL from stdin ----------
let buffer = "";
let braceCount = 0;
let start = 0;
let totalProcessed = 0;
let totalInserted = 0;
let processedObjects = 0;
const GC_EVERY = 1000;

(async function main() {
  try {
    await db.connect();
    await ensureTable();
    console.log(`✅ Connected to PostgreSQL (${TABLE})`);

    process.stdin.on("data", async (chunk) => {
      buffer += chunk.toString();

      for (let i = start; i < buffer.length; i++) {
        const ch = buffer[i];
        if (ch === "{") braceCount++;
        else if (ch === "}") {
          braceCount--;
          if (braceCount === 0 && i >= start) {
            const jsonStr = buffer.substring(start, i + 1);
            start = i + 1;

            try {
              const o = JSON.parse(jsonStr);
              const clock = o?.["@data"]?.clock || null;
              const txs = o?.["@data"]?.transactions || [];

              if (Array.isArray(txs) && txs.length > 0) {
                for (const tx of txs) {
                  totalProcessed++;
                  try {
                    await insertRow(clock, o?.["@module"], tx);
                    totalInserted++;
                    if (totalInserted % 50 === 0) {
                      console.log(`📊 ${totalInserted} inserted / ${totalProcessed} processed`);
                    }
                  } catch (e) {
                    console.error("❌ Insert error:", e.message);
                  }
                }
              }
            } catch {
              // ignore parse errors
            }

            processedObjects++;
            if (processedObjects % GC_EVERY === 0) {
              buffer = buffer.substring(start);
              start = 0;
              i = 0;
              if (global.gc) global.gc();
            }
          }
        }
      }
      buffer = buffer.substring(start);
      start = 0;
    });

    process.stdin.on("end", async () => {
      console.log(`✅ Done. Inserted ${totalInserted} / processed ${totalProcessed}`);
      await db.end();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log(`🛑 Stopped. Inserted ${totalInserted} / processed ${totalProcessed}`);
      await db.end();
      process.exit(0);
    });
  } catch (e) {
    console.error("Fatal:", e);
    process.exit(1);
  }
})();
