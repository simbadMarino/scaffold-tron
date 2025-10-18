"use client";

import { useEffect, useMemo } from "react";
import { useSessionStorage } from "usehooks-ts";
import { BarsArrowUpIcon } from "@heroicons/react/20/solid";
import { ContractUI } from "~~/app/debug/_components/contract";
import scaffoldConfig from "~~/scaffold.config";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { ContractName, GenericContract } from "~~/utils/scaffold-eth/contract";
import { useActiveNetworkInfo, useUnifiedContracts } from "~~/utils/scaffold-eth/unifiedContractsData";

const selectedContractStorageKey = "scaffoldTron.selectedContract";

export function DebugContracts() {
  const { activeBlockchain, setActiveBlockchain } = useUnifiedWeb3();
  const contractsData = useUnifiedContracts();
  const { network, explorerUrl } = useActiveNetworkInfo();
  const { ethereumEnabled, tronEnabled } = scaffoldConfig;

  const contractNames = useMemo(
    () =>
      Object.keys(contractsData).sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
      }) as ContractName[],
    [contractsData],
  );

  const [selectedContract, setSelectedContract] = useSessionStorage<ContractName>(
    selectedContractStorageKey,
    contractNames[0],
    { initializeWithValue: false },
  );

  useEffect(() => {
    if (!contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [contractNames, selectedContract, setSelectedContract]);

  const handleBlockchainSwitch = (blockchain: "ethereum" | "tron") => {
    setActiveBlockchain(blockchain);
  };

  const showBlockchainSwitcher = ethereumEnabled && tronEnabled;

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      {/* Blockchain Switcher */}
      <div className="flex flex-col items-center gap-4 w-full max-w-7xl px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Debug Contracts{showBlockchainSwitcher ? " on:" : ""}</h2>
          {showBlockchainSwitcher && (
            <div className="tabs tabs-boxed bg-base-200">
              <button
                className={`tab tab-lg ${activeBlockchain === "ethereum" ? "tab-active" : ""}`}
                onClick={() => handleBlockchainSwitch("ethereum")}
              >
                <span className="text-blue-500 mr-2">🔵</span>
                Ethereum
              </button>
              <button
                className={`tab tab-lg ${activeBlockchain === "tron" ? "tab-active" : ""}`}
                onClick={() => handleBlockchainSwitch("tron")}
              >
                <span className="text-red-500 mr-2">🔴</span>
                Tron
              </button>
            </div>
          )}
        </div>

        {/* Network Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Network:</span>
          <span>Blockchain: {activeBlockchain}</span>
          <span className="font-medium">{network?.name}</span>
          <span>•</span>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="link link-primary">
            Block Explorer
          </a>
        </div>
      </div>

      {contractNames.length === 0 ? (
        <div className="text-center">
          <p className="text-3xl mt-14">No contracts found!</p>
          <p className="text-lg text-gray-600 mt-4">
            {activeBlockchain === "tron"
              ? "Deploy your contracts to Tron using: yarn tron:deploy:testnet"
              : "Deploy your contracts to Ethereum using: yarn deploy"}
          </p>
        </div>
      ) : (
        <>
          {contractNames.length > 1 && (
            <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
              {contractNames.map(contractName => (
                <button
                  className={`btn btn-secondary btn-sm font-light hover:border-transparent ${contractName === selectedContract
                    ? "bg-base-300 hover:bg-base-300 no-animation"
                    : "bg-base-100 hover:bg-secondary"
                    }`}
                  key={contractName}
                  onClick={() => setSelectedContract(contractName)}
                >
                  {contractName}
                  {(contractsData[contractName] as GenericContract)?.external && (
                    <span className="tooltip tooltip-top tooltip-accent" data-tip="External contract">
                      <BarsArrowUpIcon className="h-4 w-4 cursor-pointer" />
                    </span>
                  )}
                  {(contractsData[contractName] as any)?.isTron && (
                    <span className="badge badge-xs badge-error ml-1">TRX</span>
                  )}
                </button>
              ))}
            </div>
          )}
          {contractNames.map(contractName => (
            <ContractUI
              key={`${activeBlockchain}-${contractName}`}
              contractName={String(contractName)}
              className={contractName === selectedContract ? "" : "hidden"}
            />
          ))}
        </>
      )}
    </div>
  );
}
