"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon, RssIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTronReadContract } from "~~/hooks/scaffold-eth/useTronReadContract";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { activeBlockchain, activeAccount, isConnected } = useUnifiedWeb3();
  const { network: tronNetwork } = useTron();

  // Ethereum contract reading
  const { data: ethereumGreeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
  });

  // Tron contract reading
  const {
    data: tronGreeting,
    isLoading: tronLoading,
    error: tronError,
  } = useTronReadContract({
    contractName: "YourContract",
    functionName: "greeting",
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-TRON</span>
            <span className="block text-sm text-gray-600 mt-2">Build on Scaffold-ETH</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected to:</p>
            <p className="my-2 font-bold text-lg">
              {activeBlockchain === "ethereum" ? "Ethereum" : "Tron"}
              {activeBlockchain === "tron" && ` (${tronNetwork?.name})`}
            </p>
          </div>
          <p className="text-center text-lg">Switch between Ethereum and Tron using the toggle in the header!</p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                  debug
                </code>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                  Block Explorer
                </code>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <RssIcon className="h-8 w-8 fill-secondary" />
              <p>
                Stream real-time TRON blockchain transactions with{" "}
                <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                  TRON Substreams
                </code>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-base-200 w-full mt-8 px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Connection Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ethereum Status */}
              <div className="bg-base-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-blue-500 mr-2">🔵</span>
                  Ethereum
                </h3>
                {connectedAddress ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Connected Address:</p>
                    <Address address={connectedAddress} />
                    <p className="text-sm text-gray-600 mt-4 mb-2">Contract Greeting:</p>
                    <p className="font-mono text-sm bg-base-200 p-2 rounded">{ethereumGreeting || "Loading..."}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Not connected</p>
                )}
              </div>

              {/* Tron Status */}
              <div className="bg-base-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-red-500 mr-2">🔴</span>
                  Tron
                </h3>
                {activeBlockchain === "tron" && isConnected ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Connected Address:</p>
                    <p className="font-mono text-sm bg-base-200 p-2 rounded break-all">{activeAccount}</p>
                    <p className="text-sm text-gray-600 mt-4 mb-2">Network:</p>
                    <p className="text-sm">{tronNetwork?.name}</p>
                    <p className="text-sm text-gray-600 mt-4 mb-2">Contract Greeting:</p>
                    {tronLoading ? (
                      <p className="text-sm">Loading...</p>
                    ) : tronError ? (
                      <p className="text-sm text-red-500">Error: {tronError}</p>
                    ) : (
                      <p className="font-mono text-sm bg-base-200 p-2 rounded">{tronGreeting || "No data"}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {activeBlockchain === "tron" ? "Not connected" : "Switch to Tron to see status"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
