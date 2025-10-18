-- TRON Transactions Database Schema
-- This schema stores filtered TRON transactions with GraphQL support

-- Create the main transactions table
CREATE TABLE IF NOT EXISTS tron_transactions (
    id SERIAL PRIMARY KEY,
    transaction_hash VARCHAR(64) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMP NOT NULL,
    contract_type VARCHAR(50) NOT NULL,
    contract_address VARCHAR(34), -- TRON addresses are 34 chars
    from_address VARCHAR(34),
    to_address VARCHAR(34),
    value DECIMAL(38,0), -- For TRX amounts (in SUN units)
    fee DECIMAL(38,0),
    result VARCHAR(20),
    raw_data JSONB, -- Store full transaction data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tron_transactions_contract_address ON tron_transactions(contract_address);
CREATE INDEX IF NOT EXISTS idx_tron_transactions_from_address ON tron_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_tron_transactions_to_address ON tron_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_tron_transactions_block_number ON tron_transactions(block_number);
CREATE INDEX IF NOT EXISTS idx_tron_transactions_block_timestamp ON tron_transactions(block_timestamp);
CREATE INDEX IF NOT EXISTS idx_tron_transactions_contract_type ON tron_transactions(contract_type);

-- Create a view for contract-specific transactions
CREATE OR REPLACE VIEW contract_transactions AS
SELECT 
    t.*,
    CASE 
        WHEN contract_type = 'TriggerSmartContract' THEN 'Smart Contract'
        WHEN contract_type = 'TransferContract' THEN 'TRX Transfer'
        WHEN contract_type = 'TransferAssetContract' THEN 'TRC10 Transfer'
        ELSE contract_type
    END as contract_type_display
FROM tron_transactions t
WHERE contract_address IS NOT NULL;

-- Create a function to get transactions by contract address
CREATE OR REPLACE FUNCTION get_transactions_by_contract(
    contract_addr VARCHAR(34),
    limit_count INTEGER DEFAULT 100,
    offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
    transaction_hash VARCHAR(64),
    block_number BIGINT,
    block_timestamp TIMESTAMP,
    contract_type VARCHAR(50),
    from_address VARCHAR(34),
    to_address VARCHAR(34),
    value DECIMAL(38,0),
    raw_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.transaction_hash,
        t.block_number,
        t.block_timestamp,
        t.contract_type,
        t.from_address,
        t.to_address,
        t.value,
        t.raw_data
    FROM tron_transactions t
    WHERE t.contract_address = contract_addr
    ORDER BY t.block_timestamp DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security for multi-tenant support (optional)
ALTER TABLE tron_transactions ENABLE ROW LEVEL SECURITY;

-- Create a policy for public read access (adjust as needed)
CREATE POLICY "Public read access" ON tron_transactions FOR SELECT USING (true); 