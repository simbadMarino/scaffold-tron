"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { BanknotesIcon, Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { TronConnectButton } from "~~/components/scaffold-eth/TronConnectButton";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { TRON_NETWORKS } from "~~/services/web3/tronConfig";
import { useUnifiedWeb3 } from "~~/services/web3/unifiedWeb3Context";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

// Get menu links based on configuration
const getMenuLinks = (): HeaderMenuLink[] => {
  const { tronEnabled } = scaffoldConfig;

  const baseLinks: HeaderMenuLink[] = [
    {
      label: "Home",
      href: "/",
    },
  ];

  // Only add TRON Substreams if tronEnabled is true
  if (tronEnabled) {
    baseLinks.push({
      label: "TRON Substreams",
      href: "/substreams",
    });
  }

  baseLinks.push({
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  });

  return baseLinks;
};

export const menuLinks: HeaderMenuLink[] = getMenuLinks();

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${isActive ? "bg-secondary shadow-md" : ""
                } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

// Tron Faucet Button Component
const TronFaucetButton = () => {
  const { targetTronNetwork } = scaffoldConfig;
  const tronNetworkInfo = TRON_NETWORKS[targetTronNetwork.id];

  // Only show faucet for testnets
  if (!tronNetworkInfo.testnet || !tronNetworkInfo.faucetUrl) {
    return null;
  }

  const handleFaucetClick = () => {
    window.open(tronNetworkInfo.faucetUrl, "_blank");
  };

  return (
    <button
      className="ml-1 btn btn-secondary btn-sm px-2 rounded-full"
      onClick={handleFaucetClick}
      title={`${tronNetworkInfo.name} Faucet`}
    >
      <BanknotesIcon className="h-4 w-4" />
    </button>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const { activeBlockchain } = useUnifiedWeb3();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  // Determine what connection component to show based on configuration
  const showConnectionComponent = () => {
    const { ethereumEnabled, tronEnabled } = scaffoldConfig;

    if (ethereumEnabled && tronEnabled) {
      // Both enabled - show unified switcher
      return <TronConnectButton />;
    } else if (ethereumEnabled && !tronEnabled) {
      // Only Ethereum enabled
      return <RainbowKitCustomConnectButton />;
    } else if (!ethereumEnabled && tronEnabled) {
      // Only Tron enabled - show Tron-only version
      return <TronConnectButton />;
    } else {
      // Neither enabled - show nothing
      return null;
    }
  };

  // Determine what faucet button to show based on active blockchain
  const showFaucetButton = () => {
    if (activeBlockchain === "tron") {
      // Show Tron faucet for testnets only
      return <TronFaucetButton />;
    } else {
      // Show Ethereum faucet for local networks only
      return isLocalNetwork && <FaucetButton />;
    }
  };

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="Scaffold-TRON logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">tronbench</span>
            <span className="text-xs">powered by Scaffold</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        {showConnectionComponent()}
        {showFaucetButton()}
      </div>
    </div>
  );
};
