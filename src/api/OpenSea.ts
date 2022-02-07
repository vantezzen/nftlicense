import fetch from 'node-fetch';
import { Api } from './Api';

type OwnershipInfo = {
  success?: false;
  ownership?: {
    quantity: number;
  };
};

export default class OpenSeaApi implements Api {
  /**
   * Create a license checker for a specific NFT. The required NFT details
   * can be found on the OpenSea page for your NFT under "Details".
   *
   * @param contractAddress Your NFT's contract address
   * @param tokenId Token ID
   * @param apiKey Optional API Key for the OpenSea API. Leaving this as null will result in the API access being rate limited
   */
  constructor(
    private contractAddress: string,
    private tokenId: string,
    private apiKey: string | null = null
  ) {}

  /**
   * Validate that an arbitrary wallet address has a valid license for the NFT
   *
   * @param address Address to check
   */
  async hasValidLicense(address: string): Promise<boolean> {
    const ownershipInfo = await this.getNftOwnershipInfo(address);
    return this.isOwnershopInfoValidLicense(ownershipInfo);
  }

  private async getNftOwnershipInfo(address: string): Promise<OwnershipInfo> {
    const response = await fetch(
      `https://api.opensea.io/api/v1/asset/${this.contractAddress}/${this.tokenId}/?account_address=${address}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(this.apiKey !== null
            ? {
                'X-API-KEY': this.apiKey,
              }
            : {}),
        },
      }
    );

    if (response.status === 403) {
      throw new Error(
        'OpenSea API has been throttled by CloudFlare. If available, provide an API Key to reduce throttling by OpenSea.'
      );
    }

    const body = await response.json();
    return body as OwnershipInfo;
  }

  private isOwnershopInfoValidLicense(ownership: OwnershipInfo): boolean {
    if ('success' in ownership && ownership.success === false) {
      return false;
    }

    if (ownership.ownership && ownership.ownership.quantity > 0) {
      return true;
    }
    return false;
  }
}
