const { TronWeb } = require("tronweb");
require('dotenv').config();


// ========== CONFIGURATION ==========
const CONFIG = {
    iterations: 15,
    energyDelegateAmount: 850e6,        //Approx 68k energy in Nile (900 TRX in stake)
    delegateDurationMs: 3000,        // ms to keep energy delegated
    delayBeforeTransferMs: 2000,      // ms to wait before token transfer
    tokenAmountToSend: 0.2,           // USDT or other token amount
    tokenAddress: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj', // USDT on Nile
    receiverAddress: 'TJDMQzjJSh5eC8WezVtnDXDuWXAwjV23eF', // TEST receiver
    tronNode: 'https://api.nileex.io' // Nile testnet node
};

// ========== ACCOUNTS (use .env for keys) ==========
const ENERGY_POOL_PK = process.env.ENERGY_POOL_PK;
const CUSTOMER_PK = process.env.CUSTOMER_PK;

// ========== INIT TRONWEB CLIENTS ==========
const energyPool = new TronWeb({
    fullHost: CONFIG.tronNode,
    privateKey: ENERGY_POOL_PK
});

const customer = new TronWeb({
    fullHost: CONFIG.tronNode,
    privateKey: CUSTOMER_PK
});

// ========== UTILITY ==========
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ========== MAIN FUNCTION ==========
const runDelegationScript = async () => {
    const energyPoolAddr = await energyPool.address.fromPrivateKey(ENERGY_POOL_PK);
    const customerAddr = await customer.address.fromPrivateKey(CUSTOMER_PK);

    console.log(`Energy Pool: ${energyPoolAddr}`);
    console.log(`Customer: ${customerAddr}`);

    for (let i = 0; i < CONFIG.iterations; i++) {
        console.log(`\n▶️ Iteration ${i + 1} of ${CONFIG.iterations}`);

        // --- 1. Delegate ENERGY ---
        try {
            console.log(`⚡ Delegating ${CONFIG.energyDelegateAmount / 1e6} Staked TRX  to ${customerAddr}...`);
            //tronWeb.transactionBuilder.delegateResource(amount, receiverAddress, resource, address, lock, lockPeriod, options);
            const delegateTx = await energyPool.transactionBuilder.delegateResource(
                CONFIG.energyDelegateAmount,
                customerAddr,
                "ENERGY",
                energyPoolAddr,
                false,
            );
            const signedDelegate = await energyPool.trx.sign(delegateTx);
            const broadcastDelegate = await energyPool.trx.sendRawTransaction(signedDelegate);
            console.log('✅ Energy delegated. TX:', broadcastDelegate.txid);
        } catch (err) {
            console.error('❌ Energy delegation failed:', err.message);
            continue;
        }

        // --- 2. Wait before token transfer ---
        console.log(`⏱️ Waiting ${CONFIG.delayBeforeTransferMs / 1000}s before transfer...`);
        await sleep(CONFIG.delayBeforeTransferMs);

        // --- 3. Token transfer from Customer ---
        try {
            const tokenDecimals = 6;
            const tokenAmount = BigInt(CONFIG.tokenAmountToSend * 10 ** tokenDecimals);

            const contract = await customer.contract().at(CONFIG.tokenAddress);
            const tx = await contract.methods.transfer(CONFIG.receiverAddress, tokenAmount).send();

            console.log(`✅ Token sent: TX ${tx}`);
        } catch (err) {
            console.error('❌ Token transfer failed:', err.message);
        }

        // --- 4. Wait and undelegate ---
        console.log(`⏳ Waiting ${CONFIG.delegateDurationMs / 1000}s before undelegation...`);
        await sleep(CONFIG.delegateDurationMs);

        try {
            console.log(`🔄 Undelegating energy from Customer...`);
            //const transaction = await tronWeb.transactionBuilder.undelegateResource(amount, receiverAddress, resource, address, options);
            const undelegateTx = await energyPool.transactionBuilder.undelegateResource(
                CONFIG.energyDelegateAmount,
                customerAddr,
                "ENERGY",
                energyPoolAddr,
                false,
            );
            const signedUndelegate = await energyPool.trx.sign(undelegateTx);
            const broadcastUndelegate = await energyPool.trx.sendRawTransaction(signedUndelegate);
            console.log('✅ Energy undelegated. TX:', broadcastUndelegate.txid);
        } catch (err) {
            console.error('❌ Undelegation failed:', err.message);
        }
    }

    console.log('\n🎉 Finished all iterations!');
};

runDelegationScript();
