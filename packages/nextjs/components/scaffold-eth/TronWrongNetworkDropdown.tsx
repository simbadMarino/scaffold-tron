/* eslint-disable */

"use client";
import { useState } from "react";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useTronNetworkCheck } from "~~/hooks/scaffold-eth/useTronNetworkCheck";
import { useTron } from "~~/services/web3/tronConfig";

export const TronWrongNetworkDropdown = () => {
  const { disconnect, availableNetworks } = useTron();
  const { expectedNetwork } = useTronNetworkCheck();
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="dropdown dropdown-end mr-2">
      <label tabIndex={0} className="btn btn-error btn-sm dropdown-toggle gap-1">
        <span>Wrong Tron network</span>
        <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 mt-1 shadow-center shadow-accent bg-base-200 rounded-box gap-1 min-w-72"
      >
        <li>
          <div className="menu-item btn-sm rounded-xl p-3 bg-warning/20">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">Network Mismatch</p>
                <p className="text-xs text-base-content/70">
                  Please switch to <strong>{expectedNetwork.name}</strong> in your TronLink wallet
                </p>
              </div>
            </div>
          </div>
        </li>

        <li>
          <button
            className="menu-item btn-sm rounded-xl flex gap-3 py-3 text-left"
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <span className="text-info">ℹ️</span>
            <span>How to switch networks</span>
          </button>
        </li>

        {showInstructions && (
          <li>
            <div className="menu-item btn-sm rounded-xl p-3 bg-info/10">
              <div className="text-xs text-base-content/80 space-y-2">
                <p className="font-medium">Steps to switch TronLink network:</p>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Open your TronLink wallet extension</li>
                  <li>Click on the network name at the top</li>
                  <li>Select "{expectedNetwork.name}"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </li>
        )}

        <li>
          <div className="menu-item btn-sm rounded-xl p-3">
            <div className="text-xs space-y-1">
              <p>
                <strong>Expected:</strong> {expectedNetwork.name}
              </p>
              <p className="text-base-content/60 break-all">{expectedNetwork.fullHost}</p>
            </div>
          </div>
        </li>

        <li>
          <button
            className="menu-item text-error btn-sm rounded-xl flex gap-3 py-3"
            type="button"
            onClick={() => disconnect()}
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span>Disconnect</span>
          </button>
        </li>
      </ul>
    </div>
  );
};
