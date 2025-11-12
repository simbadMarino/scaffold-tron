#!/usr/bin/env node
const { Client } = require("pg");
const readline = require("readline");
const crypto = require("crypto");

// ---- CLI: Base58 recipient (required) ----
const TARGET_TO_B58 = (process.argv[2] || "").trim();
if (!TARGET_TO_B58) {
  console.error("Usage: ... | node scripts/store-evm-usdt-to-final.js <Base58_to_address>");
  process.exit(1);
}

// ---- DB ----
const TABLE = "filtered_usdt_to";
const db = new Client({ host:"localhost", port:5437, database:"tron_transactions", user:"tron_user", password:"tron_password" });

// ---- helpers ----
const B58="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const MAP=Object.fromEntries([...B58].map((c,i)=>[c,i]));
function b58decode(s){let n=0n;for(const ch of s){const v=MAP[ch];if(v===undefined)throw new Error("bad base58");n=n*58n+BigInt(v)}let a=[];while(n>0n){a.push(Number(n%256n));n/=256n}a=a.reverse();let i=0;while(i<s.length && s[i]==='1'){a.unshift(0);i++}return Buffer.from(a)}
function b58checkDecode(s){const raw=b58decode(s); if(raw.length<5) throw new Error("too short");
  const pl=raw.slice(0,raw.length-4), cs=raw.slice(raw.length-4);
  const h1=crypto.createHash("sha256").update(pl).digest(), h2=crypto.createHash("sha256").update(h1).digest();
  if(!cs.equals(h2.slice(0,4))) throw new Error("checksum mismatch"); return pl }
function tronB58ToEvmHex20(b58){ const payload=b58checkDecode(b58); if(payload[0]!==0x41||payload.length!==21) throw new Error("not TRON payload"); return "0x"+Buffer.from(payload.slice(1)).toString("hex").toLowerCase() }
function evmHex20ToTronB58(h){ const hex=h.replace(/^0x/,'').toLowerCase(); const payload=Buffer.concat([Buffer.from([0x41]), Buffer.from(hex,'hex')]);
  const h1=crypto.createHash("sha256").update(payload).digest(), h2=crypto.createHash("sha256").update(h1).digest();
  const cs=h2.slice(0,4); return base58Encode(Buffer.concat([payload, cs])) }
function base58Encode(buf){ if(!buf||!buf.length) return ""; let n=0n; for(const b of buf) n=(n<<8n)+BigInt(b);
  let out=""; while(n>0n){const m=Number(n%58n); n/=58n; out=B58[m]+out} let i=0; while(i<buf.length&&buf[i]===0){out="1"+out;i++} return out }
function padTopic32(hex20){ const h=hex20.replace(/^0x/,'').toLowerCase(); return "0x"+h.padStart(64,"0") }
function topic20(t32){ if(!t32||t32.length!==66||!t32.startsWith("0x")) return null; return "0x"+t32.slice(26) }

const USDT_EVM="0xa614f803b6fd780986a42c78ec9c7f77e6ded13c";
const TRANSFER_TOPIC0="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const TARGET_EVM20 = tronB58ToEvmHex20(TARGET_TO_B58);
const TARGET_TOPIC = padTopic32(TARGET_EVM20);

console.log(`[init] to_b58=${TARGET_TO_B58}`);
console.log(`[init] to_evm=${TARGET_EVM20}`);
console.log(`[init] to_topic=${TARGET_TOPIC}`);

async function ensureTable(){
  await db.query(`CREATE TABLE IF NOT EXISTS ${TABLE}(
    tx_hash CHAR(64) PRIMARY KEY,
    from_address VARCHAR(35),
    to_address   VARCHAR(35) NOT NULL,
    amount       NUMERIC(38,0) NOT NULL
  );`);
  console.log(`[db] table ${TABLE} ready`);
}
async function insert(tx, fromB58, toB58, amount){
  console.log(`[db] INSERT tx=${tx} from=${fromB58||""} to=${toB58} amt=${amount}`);
  await db.query(
    `INSERT INTO ${TABLE}(tx_hash,from_address,to_address,amount)
     VALUES($1,$2,$3,$4)
     ON CONFLICT(tx_hash) DO UPDATE SET
       from_address=EXCLUDED.from_address,
       to_address  =EXCLUDED.to_address,
       amount      =EXCLUDED.amount`,
    [tx, fromB58||"", toB58, amount]
  );
}

function evAddr(ev){ return (ev?.log?.address||"").toLowerCase() }
function evTopics(ev){ return Array.isArray(ev?.log?.topics)? ev.log.topics.map(x=>x.toLowerCase()) : [] }
function evData(ev){ return (ev?.log?.data||"0x").toLowerCase() }
function evTxHash(ev){ return (ev?.txHash||ev?.transaction_hash||ev?.tx_hash||"").toLowerCase() }

(async function main(){
  await db.connect(); console.log(`[db] connected`); await ensureTable();

  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  let lines=0, matched=0, inserted=0;

  rl.on("line", async (line)=>{
    lines++; if(!line || line[0]!=="{") return;
    let o; try{o=JSON.parse(line);}catch{ return; }
    const evs = o?.["@data"]?.events; if(!Array.isArray(evs)||evs.length===0) return;
    //console.log(`[l${lines}] events=${evs.length}`);

    for(const ev of evs){
      const addr=evAddr(ev), topics=evTopics(ev), data=evData(ev), txh=evTxHash(ev);
      //console.log(`[l${lines}] ev addr=${addr||"<none>"} t0=${topics[0]?.slice(0,10)||"<none>"} t2=${topics[2]?.slice(0,18)||"<none>"}`);

      if(addr!==USDT_EVM) continue;
      if((topics[0]||"")!==TRANSFER_TOPIC0) continue;

      // compare TO as topic
      if((topics[2]||"")!==TARGET_TOPIC) continue;

      // decode addresses & amount
      const from20=topic20(topics[1]), to20=topic20(topics[2]);
      if(!from20 || !to20) { console.log(`[l${lines}] bad topic format`); continue; }

      // convert to TRON Base58 for logging/DB
      const toB58 = TARGET_TO_B58; // guaranteed by match
      const fromB58 = (()=>{
        const payload="41"+from20.slice(2); // 0x41 + 20 bytes
        const plBuf=Buffer.from(payload,"hex");
        const h1=crypto.createHash("sha256").update(plBuf).digest();
        const h2=crypto.createHash("sha256").update(h1).digest();
        const cs=h2.slice(0,4);
        return base58Encode(Buffer.concat([plBuf, cs]));
      })();

      const amount = (data && data!=="0x") ? BigInt(data).toString(10) : "0";

      console.log(`[MATCH] tx=${txh} from=${fromB58} to=${toB58} amt=${amount}`);
      matched++;
      if(!txh || amount==="0") continue;

      try{ await insert(txh, fromB58, toB58, amount); inserted++; }
      catch(e){ console.error(`[insert-error] ${e.message}`); }
    }
  });

  rl.on("close", async ()=>{ console.log(`[done] lines=${lines} matched=${matched} inserted=${inserted}`); await db.end(); process.exit(0); });
  process.on("SIGINT", async ()=>{ console.log(`[sigint] lines=${lines} matched=${matched} inserted=${inserted}`); await db.end(); process.exit(0); });
})();
