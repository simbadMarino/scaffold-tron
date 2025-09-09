/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import {
  GET_ALL_TRANSACTIONS,
  GET_TRANSACTIONS_BY_CONTRACT,
  TransactionsResponse,
  TronTransaction,
  graphqlClient,
} from "../../lib/graphql-client";
import { useQuery } from "urql";
import { AddressInput, TronAddress } from "~~/components/scaffold-eth";
import { getTronScanTxHash } from "~~/utils/scaffold-eth/tron-address-utils";

export default function SubstreamsPage() {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [isFiltered, setIsFiltered] = useState(false);

  // Query for transactions
  const [result, reexecuteQuery] = useQuery<TransactionsResponse>({
    query: isFiltered ? GET_TRANSACTIONS_BY_CONTRACT : GET_ALL_TRANSACTIONS,
    variables: {
      contractAddress: contractAddress,
      first: pageSize,
      offset: page * pageSize,
    },
    pause: !contractAddress && isFiltered,
  });

  const { data, fetching, error } = result;

  const handleFilter = (address: string) => {
    setContractAddress(address);
    setIsFiltered(!!address);
    setPage(0);
  };

  const handleClearFilter = () => {
    setContractAddress("");
    setIsFiltered(false);
    setPage(0);
  };

  const formatValue = (value: string | null | undefined) => {
    if (!value) return "0";
    // Convert from SUN to TRX (1 TRX = 1,000,000 SUN)
    const trxValue = parseInt(value) / 1_000_000;
    return trxValue.toLocaleString();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString() + " " + new Date(timestamp).toLocaleTimeString();
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case "TransferContract":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "TriggerSmartContract":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "TransferAssetContract":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "FreezeBalanceContract":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "UnfreezeBalanceContract":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const transactions = data?.allTronTransactions?.nodes || [];
  const totalCount = data?.allTronTransactions?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto px-4 py-8 max-w-[95vw]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">TRON Transactions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Real-time TRON blockchain transactions streamed directly to database
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Filter Transactions</h2>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contract Address
              </label>
              <AddressInput
                placeholder="Enter contract address"
                value={contractAddress}
                onChange={setContractAddress}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => handleFilter(contractAddress)}
                disabled={!contractAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Filter
              </button>
              <button
                onClick={handleClearFilter}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
          {isFiltered && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Showing transactions for contract: <TronAddress address={contractAddress} />
              </p>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isFiltered
              ? `Found ${totalCount} transactions for contract ${contractAddress}`
              : `Showing ${totalCount} recent transactions`}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {fetching && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">Error loading transactions: {error.message}</p>
        </div>
      )}

      {/* Transactions Table */}
      {!fetching && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ minWidth: "1200px" }}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                    Transaction Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-36">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-28">
                    Value (TRX)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">
                    Contract
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx: TronTransaction) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      <a
                        href={`https://tronscan.org/#/transaction/${getTronScanTxHash(tx.transactionHash)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {tx.transactionHash.substring(0, 10)}...
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <a
                        href={`https://tronscan.org/#/block/${tx.blockNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {tx.blockNumber.toLocaleString()}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatTimestamp(tx.blockTimestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getContractTypeColor(tx.contractType)}`}>
                        {tx.contractType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.fromAddress ? (
                        <TronAddress address={tx.fromAddress} />
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.toAddress ? (
                        <TronAddress address={tx.toAddress} />
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatValue(tx.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.contractAddress ? (
                        <TronAddress address={tx.contractAddress} />
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex justify-between">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!fetching && !error && transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          {isFiltered && <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your filter criteria</p>}
        </div>
      )}
    </div>
  );
}
