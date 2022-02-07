/**
 * NFTLicense API
 * API that validates that an address contains the NFT
 */
export interface Api {
  hasValidLicense(address: string): Promise<boolean>;
}
