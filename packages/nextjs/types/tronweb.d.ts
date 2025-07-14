declare module "tronweb" {
  export default class TronWeb {
    constructor(options: { fullHost?: string; solidityNode?: string; eventServer?: string; privateKey?: string });

    static utils: {
      crypto: any;
      code: any;
      base58: any;
      abi: any;
    };

    utils: {
      crypto: any;
      code: any;
      base58: any;
      abi: any;
    };

    trx: {
      getBalance(address: string): Promise<number>;
      sendRawTransaction(signedTransaction: any): Promise<any>;
      sign(transaction: any, privateKey?: string): Promise<any>;
      broadcast(signedTransaction: any): Promise<any>;
    };

    contract(): any;

    fromSun(sun: number): string;
    toSun(trx: number): number;

    isAddress(address: string): boolean;

    address: {
      fromHex(hex: string): string;
      toHex(base58: string): string;
    };

    defaultAddress: {
      base58: string;
      hex: string;
    };

    ready: boolean;
  }
}

declare global {
  interface Window {
    tronLink: {
      ready: boolean;
      request(params: { method: string }): Promise<any>;
    };
    tronWeb: {
      ready: boolean;
      defaultAddress: {
        base58: string;
        hex: string;
      };
      trx: {
        getBalance(address: string): Promise<number>;
        sendRawTransaction(signedTransaction: any): Promise<any>;
        sign(transaction: any, privateKey?: string): Promise<any>;
        broadcast(signedTransaction: any): Promise<any>;
      };
      contract(abi: any[], address: string): any;
      fromSun(sun: number): string;
      toSun(trx: number): number;
      isAddress(address: string): boolean;
      address: {
        fromHex(hex: string): string;
        toHex(base58: string): string;
      };
    };
  }
}
