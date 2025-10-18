/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type ReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  inheritedFrom?: string;
  abi: Abi;
};

export const ReadOnlyFunctionForm = ({
  contractAddress,
  abiFunction,
  inheritedFrom,
  abi,
}: ReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [result, setResult] = useState<unknown>();
  const [isManualLoading, setIsManualLoading] = useState(false);

  const { activeBlockchain } = useUnifiedWeb3();
  const { tronWeb, network: tronNetwork } = useTron();
  const { targetNetwork } = useTargetNetwork();

  // For Ethereum contracts
  const ethereumRead = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    chainId: targetNetwork.id,
    query: {
      enabled: false,
      retry: false,
    },
  });

  const isLoading = activeBlockchain === "ethereum" ? ethereumRead.isFetching : isManualLoading;
  const error = activeBlockchain === "ethereum" ? ethereumRead.error : null;

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error);
      notification.error(parsedError);
    }
  }, [error]);

  const transformedFunction = transformAbiFunction(abiFunction);
  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="font-medium my-0 break-words">
        {abiFunction.name}
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </p>
      {inputElements}
      <div className="flex flex-col md:flex-row justify-between gap-2 flex-wrap">
        <div className="grow w-full md:max-w-[80%]">
          {result !== null && result !== undefined && (
            <div className="bg-secondary rounded-3xl text-sm px-4 py-1.5 break-words overflow-auto">
              <p className="font-bold m-0 mb-1">Result:</p>
              <pre className="whitespace-pre-wrap break-words">{displayTxResult(result, "sm")}</pre>
            </div>
          )}
        </div>
        <button
          className="btn btn-secondary btn-sm self-end md:self-start"
          onClick={async () => {
            if (activeBlockchain === "ethereum") {
              const { data } = await ethereumRead.refetch();
              setResult(data);
            } else {
              // Handle Tron read
              try {
                setIsManualLoading(true);
                if (tronWeb && contractAddress) {
                  const tronContracts = (deployedTronContracts as any)[tronNetwork?.id || 0];

                  // Find the contract address from deployed contracts
                  let tronAddress = contractAddress;
                  if (tronContracts) {
                    for (const [_, contractData] of Object.entries(tronContracts)) {
                      if ((contractData as any).address) {
                        tronAddress =
                          (contractData as any).addressBase58 || (contractData as any).address;
                        break;
                      }
                    }
                  }

                  if (!tronAddress) {
                    throw new Error("Tron contract address not found");
                  }

                  console.log("Using Tron contract address:", tronAddress);
                  const contract = await tronWeb.contract().at(tronAddress);
                  const args = getParsedContractFunctionArgs(form);
                  const data = await contract[abiFunction.name](...args).call();
                  setResult(data);
                }
              } catch (error) {
                console.error("Tron contract read error:", error);
                notification.error("Failed to read from Tron contract");
              } finally {
                setIsManualLoading(false);
              }
            }
          }}
          disabled={isLoading}
        >
          {isLoading && <span className="loading loading-spinner loading-xs"></span>}
          Read 📡
        </button>
      </div>
    </div>
  );
};
