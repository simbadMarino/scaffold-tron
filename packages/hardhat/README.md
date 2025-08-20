# LayerZero Hardhat TRON Example

This project demonstrates deploying and testing a simple smart contract on the TRON Nile testnet using the [@layerzerolabs/hardhat-tron](https://www.npmjs.com/package/@layerzerolabs/hardhat-tron) plugin.

## Prerequisites

- Node.js >= 20
- npm >= 10.8.2
- A TRON wallet private key with test TRX on Nile ([Nile Faucet](https://nileex.io/join/getJoinPage))
- A TronGrid API Key ([Get one here](https://www.trongrid.io/))

## Project Structure

```
.
├── contracts/Greeter.sol          # Example smart contract
├── deploy/00_deploy_greeter.js    # Deployment script (Hardhat Deploy)
├── test/greeter.test.js           # Mocha/Chai tests
├── hardhat.config.cjs             # Hardhat config with TRON settings
├── package.json
└── .env                           # Private key & TronGrid API key
```

## Setup
Clone this repository and install dependencies:
```bash
git clone https://github.com/aziz1975/layerzero-hardhat-tron.git
```

```bash
npm install
```

## Environment Setup

Create a `.env` file in the project root:

```env
TRON_PRIVATE_KEY=your_tron_private_key_here
TRON_PRO_API_KEY=your_trongrid_api_key_here
```

## Compilation

Compile contracts for TRON:

```bash
npx hardhat compile
```

## Deployment to Nile Testnet

```bash
npx hardhat deploy --network nile
```

This will deploy the `Greeter` contract with the constructor argument `"Hello TRON!"`.

## Running Tests

Tests are written using Mocha/Chai. The default `greeter.test.js` runs against the local Hardhat network.

```bash
npx hardhat test
```

## Important Notes

- **Compiler Version**: The TRON plugin requires `tronSolc` and `solidity` compiler entries to match (e.g., `0.8.23`).
- **Network Config**: The `nile` network in `hardhat.config.cjs` is set with:
  - URL: `https://nile.trongrid.io/jsonrpc`
  - TRON-PRO-API-KEY header
  - `tron: true` flag
- **Deployment Tooling**: Uses `@layerzerolabs/hardhat-deploy` for reproducible deployments.

## Useful Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy to Nile testnet
npx hardhat deploy --network nile

# Run tests
npx hardhat test

# Clean artifacts
npx hardhat clean
```

## References

- [LayerZero Hardhat TRON Plugin](https://www.npmjs.com/package/@layerzerolabs/hardhat-tron)
- [Hardhat Deploy Plugin](https://www.npmjs.com/package/@layerzerolabs/hardhat-deploy)
- [TRON Developer Hub](https://developers.tron.network/)
