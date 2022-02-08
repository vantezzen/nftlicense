import { LicensingRequest, LicensingResponse } from '../shared';
const Web3 = require('web3'); // web3js currently has a bug that breaks importing with "import", thus needing require

/**
 * NFTLicenseBrowser: Browser counterpart for NFTLicense to enable signing licensing requests
 *
 * Signature code based on https://github.com/amaurym/login-with-metamask-demo/blob/master/packages/frontend/src/Login/Login.tsx
 */
export default class NFTLicenseBrowser {
  private web3?: typeof Web3;

  async createLicensingResponse(
    licensingRequest: LicensingRequest
  ): Promise<LicensingResponse> {
    const answer: LicensingResponse = {
      requestId: licensingRequest.id,
    };

    const hasWalletAccess = await this.requestWalletAccess();
    if (!hasWalletAccess) {
      return answer;
    }

    const walletAddress = await this.getWalletAddress();
    if (!walletAddress) {
      return answer;
    }
    answer.publicAddress = walletAddress;

    const signature = await this.signMessage(
      licensingRequest.message,
      walletAddress
    );
    if (!signature) {
      return answer;
    }
    answer.answerMessage = signature;

    return answer;
  }

  private async requestWalletAccess(): Promise<boolean> {
    // Check if MetaMask is installed
    if (!(window as any).ethereum) {
      console.log('NFTLicense: No wallet installed');
      return false;
    }

    if (!this.web3) {
      try {
        // Request account access if needed
        await (window as any).ethereum.enable();

        // We don't know window.web3 version, so we use our own instance of Web3
        // with the injected provider given by MetaMask
        this.web3 = new Web3((window as any).ethereum);
      } catch (error) {
        console.log('NFTLicense: Access not allowed', error);
        return false;
      }
    }

    return true;
  }

  private async getWalletAddress(): Promise<string | false> {
    if (!this.web3) return false;

    const coinbase = await this.web3.eth.getCoinbase();
    if (!coinbase) {
      console.log('NFTLicense: Coinbase not activated');
      return false;
    }

    return coinbase.toLowerCase();
  }

  private async signMessage(
    message: string,
    address: string
  ): Promise<string | false> {
    try {
      const signature = await this.web3!.eth.personal.sign(
        message,
        address,
        '' // MetaMask will ignore the password argument here
      );

      return signature;
    } catch (err) {
      console.log('NFTLicense: Could not sign', err);
    }
    return false;
  }
}
