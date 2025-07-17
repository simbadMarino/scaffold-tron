# TRON Substreams Database Integration Setup Guide

This guide shows you how to stream your TRON substreams data into a PostgreSQL database with GraphQL support and integrate it with your NextJS application.

## 🎯 Overview

This setup provides:

-   **PostgreSQL Database** for storing TRON transaction data
-   **PostGraphile** for automatic GraphQL API generation
-   **React Components** for querying and displaying transaction data
-   **Contract Address Filtering** for focused data analysis
-   **Real-time Data Streaming** from TRON blockchain

## 📋 Prerequisites

Before starting, ensure you have:

1. **Substreams CLI** installed

    ```bash
    curl -sSf https://substreams.stream/install | sh
    ```

2. **Docker and Docker Compose** installed

    - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. **Substreams API Token**

    - Get it from: https://app.streamingfast.io/
    - Set it as environment variable: `export SUBSTREAMS_API_TOKEN=your_token_here`

4. **Node.js and Yarn** (already set up in Scaffold-ETH 2)

## 🚀 Quick Start

### 1. Set up the Database

Navigate to the substreams directory:

```bash
cd packages/substreams
```

Start PostgreSQL and PostGraphile:

```bash
docker-compose up -d
```

This will:

-   Start PostgreSQL on port 5432
-   Start PostGraphile GraphQL server on port 5000
-   Create the database schema automatically
-   Enable GraphQL endpoint at `http://localhost:5000/graphql`
-   Enable GraphiQL interface at `http://localhost:5000/graphiql`

### 2. Build the Substreams

Build the Rust WebAssembly module:

```bash
cargo build --target wasm32-unknown-unknown --release
```

### 3. Start Data Streaming

#### Option A: Stream All Transfer Transactions

```bash
./scripts/run-sink.sh
```

#### Option B: Filter by Contract Address

```bash
./scripts/run-sink.sh --contract TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
```

#### Option C: Custom Parameters

```bash
./scripts/run-sink.sh \
  --contract TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t \
  --start-block 50000000 \
  --end-block 50100000
```

### 4. Install Frontend Dependencies

Navigate to the NextJS app:

```bash
cd ../nextjs
yarn install
```

### 5. Configure Environment Variables

Create a `.env.local` file in the NextJS directory:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5000/graphql
```

### 6. Start the Frontend

```bash
yarn dev
```

The frontend will be available at `http://localhost:3000`

## 📊 Using the Transaction Explorer

1. **Navigate to Transactions Page**

    - Visit `http://localhost:3000/substreams`
    - Or click "Transactions" in the navigation menu

2. **Filter by Contract Address**

    - Enter a TRON contract address in the filter field
    - Click "Filter" to see transactions for that specific contract
    - Click "Clear" to see all transactions

3. **View Transaction Details**
    - Click on transaction hashes to view on TronScan
    - See formatted timestamps, values, and addresses
    - Explore contract types and transaction patterns

## 🔧 Configuration Options

### Database Connection

The default connection settings are:

```env
DATABASE_URL=postgresql://tron_user:tron_password@localhost:5432/tron_transactions
```

To use a different database, update the `docker-compose.yml` file or set the `DATABASE_URL` environment variable.

### GraphQL Endpoint

The GraphQL endpoint is available at:

-   **GraphQL API**: `http://localhost:5000/graphql`
-   **GraphiQL Interface**: `http://localhost:5000/graphiql`

### Substreams Parameters

You can filter transactions using these parameters:

1. **By Contract Type**:

    ```bash
    --params filtered_transactions="contract_type:TransferContract"
    ```

2. **By Contract Address**:

    ```bash
    --params filtered_transactions="contract_address:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    ```

3. **By From Address**:

    ```bash
    --params filtered_transactions="from:TMAP4Dnyh2og7bzW6HxZfuZqRSTHsVDKRT"
    ```

4. **Complex Filters**:
    ```bash
    --params filtered_transactions="(contract_type:TriggerSmartContract && contract_address:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t)"
    ```

## 🗃️ Database Schema

The main `tron_transactions` table includes:

| Column             | Type          | Description                                                  |
| ------------------ | ------------- | ------------------------------------------------------------ |
| `id`               | SERIAL        | Primary key                                                  |
| `transaction_hash` | VARCHAR(64)   | Unique transaction hash                                      |
| `block_number`     | BIGINT        | Block number                                                 |
| `block_timestamp`  | TIMESTAMP     | Block timestamp                                              |
| `contract_type`    | VARCHAR(50)   | Contract type (TransferContract, TriggerSmartContract, etc.) |
| `contract_address` | VARCHAR(34)   | Contract address (nullable)                                  |
| `from_address`     | VARCHAR(34)   | From address (nullable)                                      |
| `to_address`       | VARCHAR(34)   | To address (nullable)                                        |
| `value`            | DECIMAL(38,0) | Transaction value in SUN                                     |
| `fee`              | DECIMAL(38,0) | Transaction fee in SUN                                       |
| `result`           | VARCHAR(20)   | Transaction result                                           |
| `raw_data`         | JSONB         | Full transaction data                                        |
| `created_at`       | TIMESTAMP     | Record creation time                                         |

## 🔍 GraphQL Queries

### Get Transactions by Contract Address

```graphql
query GetTransactionsByContract($contractAddress: String!) {
    tronTransactions(
        condition: { contractAddress: $contractAddress }
        orderBy: BLOCK_TIMESTAMP_DESC
        first: 10
    ) {
        nodes {
            transactionHash
            blockNumber
            blockTimestamp
            contractType
            fromAddress
            toAddress
            value
            contractAddress
        }
        totalCount
    }
}
```

### Get All Recent Transactions

```graphql
query GetRecentTransactions {
    tronTransactions(orderBy: BLOCK_TIMESTAMP_DESC, first: 20) {
        nodes {
            transactionHash
            blockNumber
            blockTimestamp
            contractType
            fromAddress
            toAddress
            value
        }
    }
}
```

### Use the Custom Function

```graphql
query GetTransactionsByContractFunction($contractAddr: String!) {
    getTransactionsByContract(contractAddr: $contractAddr) {
        nodes {
            transactionHash
            blockNumber
            blockTimestamp
            contractType
            fromAddress
            toAddress
            value
        }
    }
}
```

## 🔧 Advanced Configuration

### Custom Database Schema

To modify the database schema:

1. Edit `schema.sql`
2. Restart the database:
    ```bash
    docker-compose down
    docker-compose up -d
    ```

### Custom GraphQL Queries

Add new queries to `lib/graphql-client.ts`:

```typescript
export const MY_CUSTOM_QUERY = `
  query MyCustomQuery($param: String!) {
    tronTransactions(
      filter: { /* your filter */ }
    ) {
      nodes {
        /* your fields */
      }
    }
  }
`;
```

### Performance Optimization

1. **Add Database Indexes**:

    ```sql
    CREATE INDEX idx_custom ON tron_transactions (custom_field);
    ```

2. **Configure Connection Pooling**:

    ```yaml
    # In docker-compose.yml
    environment:
        - PGBOUNCER_MAX_CLIENT_CONN=100
    ```

3. **Optimize GraphQL Queries**:
    - Use `first` and `offset` for pagination
    - Only select needed fields
    - Use database functions for complex queries

## 📈 Monitoring and Debugging

### Check Database Status

```bash
docker-compose logs postgres
```

### Check PostGraphile Status

```bash
docker-compose logs postgraphile
```

### Monitor Substreams Progress

The substreams sink will log progress and any errors during streaming.

### GraphQL Debugging

Use the GraphiQL interface at `http://localhost:5000/graphiql` to:

-   Test queries
-   Browse schema
-   Debug GraphQL issues

## 🛠️ Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Verify connection string in environment variables

### GraphQL Errors

1. Check PostGraphile logs: `docker-compose logs postgraphile`
2. Test queries in GraphiQL interface
3. Verify database schema is correct

### Substreams Issues

1. Check API token is set: `echo $SUBSTREAMS_API_TOKEN`
2. Verify network connectivity
3. Check substreams logs for errors

### Frontend Issues

1. Ensure GraphQL endpoint is accessible
2. Check browser console for errors
3. Verify environment variables are set

## 📚 Resources

-   [Substreams Documentation](https://docs.substreams.dev/)
-   [PostGraphile Documentation](https://www.graphile.org/postgraphile/)
-   [URQL Documentation](https://urql.dev/)
-   [TRON Documentation](https://developers.tron.network/)

## 🤝 Contributing

To extend this setup:

1. **Add New Data Fields**: Modify the database schema and Rust transformation code
2. **Create Custom Queries**: Add new GraphQL queries and React components
3. **Enhance Filtering**: Extend the substreams filtering capabilities
4. **Add Visualizations**: Create charts and graphs from the transaction data

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
