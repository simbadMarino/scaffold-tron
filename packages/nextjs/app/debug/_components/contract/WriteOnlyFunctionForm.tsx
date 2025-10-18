/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt } from "viem";
import { useAccount, useConfig, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  ContractInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { IntegerInput } from "~~/components/scaffold-eth";
import deployedTronContracts from "~~/contracts/deployedTronContracts";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useTron } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";
import { notification } from "~~/utils/scaffold-eth";
import { simulateContractWriteAndNotifyError } from "~~/utils/scaffold-eth/contract";

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  inheritedFrom?: string;
};

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string>("");
  const [isTronLoading, setIsTronLoading] = useState(false);
  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const { activeBlockchain } = useUnifiedWeb3();
  const { tronWeb, account, network: tronNetwork } = useTron();

  const ethereumWriteDisabled = !chain || chain?.id !== targetNetwork.id;
  const tronWriteDisabled = !tronWeb || !account?.address;
  const writeDisabled = activeBlockchain === "ethereum" ? ethereumWriteDisabled : tronWriteDisabled;

  const { data: result, isPending, writeContractAsync } = useWriteContract();
  const isLoading = activeBlockchain === "ethereum" ? isPending : isTronLoading;

  const wagmiConfig = useConfig();

  const handleWrite = async () => {
    if (activeBlockchain === "ethereum") {
      if (writeContractAsync) {
        try {
          const writeContractObj = {
            address: contractAddress,
            functionName: abiFunction.name,
            abi: abi,
            args: getParsedContractFunctionArgs(form),
            value: BigInt(txValue),
          };
          await simulateContractWriteAndNotifyError({ wagmiConfig, writeContractParams: writeContractObj });

          const makeWriteWithParams = () => writeContractAsync(writeContractObj);
          await writeTxn(makeWriteWithParams);
          onChange();
        } catch (e: any) {
          console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
        }
      }
    } else {
      // Handle Tron write
      try {
        setIsTronLoading(true);
        if (tronWeb && contractAddress && account?.address) {
          // Use window.tronWeb directly to ensure wallet connection
          const walletTronWeb = window.tronWeb;
          if (!walletTronWeb) {
            throw new Error("TronLink wallet not connected");
          }

          // Ensure the wallet is connected to the correct address
          if (!walletTronWeb.defaultAddress || walletTronWeb.defaultAddress.base58 !== account.address) {
            throw new Error("Wallet address mismatch");
          }

          // Get the actual Tron address from deployedTronContracts
          const tronContracts = (deployedTronContracts as any)[tronNetwork?.id || 0];

          // Find the contract name by searching for the address (though this is a bit hacky)
          let tronAddress = contractAddress;
          if (tronContracts) {
            for (const [contractName, contractData] of Object.entries(tronContracts)) {
              if ((contractData as any).address) {
                tronAddress = (contractData as any).address;
                break;
              }
            }
          }

          if (!tronAddress) {
            throw new Error("Tron contract address not found");
          }

          console.log("Using Tron contract address for write:", tronAddress);
          console.log("User address:", account.address);
          console.log("Wallet TronWeb default address:", walletTronWeb.defaultAddress);

          const contract = await walletTronWeb.contract(abi, tronAddress);
          const args = getParsedContractFunctionArgs(form);

          const options: any = {
            feeLimit: 1000000000, // 1000 TRX fee limit
          };

          if (abiFunction.stateMutability === "payable" && txValue) {
            options.callValue = walletTronWeb.toSun(txValue);
          }

          // Execute the transaction using the contract method
          const transaction = await contract[abiFunction.name](...args).send(options);
          notification.success(`Transaction sent: ${transaction}`);
          onChange();
        }
      } catch (error) {
        console.error("Tron contract write error:", error);
        notification.error("Failed to write to Tron contract");
      } finally {
        setIsTronLoading(false);
      }
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransactionReceipt({
    hash: result,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const transformedFunction = transformAbiFunction(abiFunction);
  const inputs = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">
          {abiFunction.name}
          <InheritanceTooltip inheritedFrom={inheritedFrom} />
        </p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center ml-2">
              <span className="text-xs font-medium mr-2 leading-none">payable value</span>
              <span className="block text-xs font-extralight leading-none">wei</span>
            </div>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined);
                setTxValue(updatedTxValue);
              }}
              placeholder="value (wei)"
            />
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="grow basis-0">{displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}</div>
          )}
          <div
            className={`flex ${writeDisabled &&
              "tooltip tooltip-bottom tooltip-secondary before:content-[attr(data-tip)] before:-translate-x-1/3 before:left-auto before:transform-none"
              }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button className="btn btn-secondary btn-sm" disabled={writeDisabled || isLoading} onClick={handleWrite}>
              {isLoading && <span className="loading loading-spinner loading-xs"></span>}
              Send 💸
            </button>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
