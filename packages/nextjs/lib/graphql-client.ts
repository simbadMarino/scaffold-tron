import { cacheExchange, createClient, fetchExchange } from "urql";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5001/graphql";

export const graphqlClient = createClient({
  url: GRAPHQL_ENDPOINT,
  exchanges: [cacheExchange, fetchExchange],
});

// GraphQL queries for TRON transactions
export const GET_TRANSACTIONS_BY_CONTRACT = `
  query GetTransactionsByContract($contractAddress: String!, $first: Int = 10, $offset: Int = 0) {
    allTronTransactions(
      condition: { contractAddress: $contractAddress }
      first: $first
      offset: $offset
      orderBy: BLOCK_TIMESTAMP_DESC
    ) {
      nodes {
        id
        transactionHash
        blockNumber
        blockTimestamp
        contractType
        contractAddress
        fromAddress
        toAddress
        value
        fee
        result
        rawData
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_ALL_TRANSACTIONS = `
  query GetAllTransactions($first: Int = 10, $offset: Int = 0) {
    allTronTransactions(
      first: $first
      offset: $offset
      orderBy: BLOCK_TIMESTAMP_DESC
    ) {
      nodes {
        id
        transactionHash
        blockNumber
        blockTimestamp
        contractType
        contractAddress
        fromAddress
        toAddress
        value
        fee
        result
        rawData
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_TRANSACTIONS_BY_ADDRESS = `
  query GetTransactionsByAddress($address: String!, $first: Int = 10, $offset: Int = 0) {
    allTronTransactions(
      filter: {
        or: [
          { fromAddress: { equalTo: $address } }
          { toAddress: { equalTo: $address } }
        ]
      }
      first: $first
      offset: $offset
      orderBy: BLOCK_TIMESTAMP_DESC
    ) {
      nodes {
        id
        transactionHash
        blockNumber
        blockTimestamp
        contractType
        contractAddress
        fromAddress
        toAddress
        value
        fee
        result
        rawData
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_CONTRACT_TRANSACTIONS = `
  query GetContractTransactions($first: Int = 10, $offset: Int = 0) {
    allContractTransactions(
      first: $first
      offset: $offset
      orderBy: BLOCK_TIMESTAMP_DESC
    ) {
      nodes {
        id
        transactionHash
        blockNumber
        blockTimestamp
        contractType
        contractTypeDisplay
        contractAddress
        fromAddress
        toAddress
        value
        fee
        result
        rawData
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_TRANSACTIONS_BY_CONTRACT_FUNCTION = `
  query GetTransactionsByContractFunction($contractAddr: String!, $limitCount: Int = 100, $offsetCount: Int = 0) {
    getTransactionsByContract(
      contractAddr: $contractAddr
      limitCount: $limitCount
      offsetCount: $offsetCount
    ) {
      nodes {
        transactionHash
        blockNumber
        blockTimestamp
        contractType
        fromAddress
        toAddress
        value
        rawData
      }
    }
  }
`;

// TypeScript types for the GraphQL responses
export interface TronTransaction {
  id: string;
  transactionHash: string;
  blockNumber: number;
  blockTimestamp: string;
  contractType: string;
  contractAddress?: string;
  fromAddress?: string;
  toAddress?: string;
  value?: string;
  fee?: string;
  result?: string;
  rawData?: any;
  createdAt: string;
}

export interface TransactionsResponse {
  allTronTransactions: {
    nodes: TronTransaction[];
    totalCount: number;
  };
}

export interface ContractTransactionsResponse {
  allContractTransactions: {
    nodes: (TronTransaction & { contractTypeDisplay: string })[];
    totalCount: number;
  };
}
