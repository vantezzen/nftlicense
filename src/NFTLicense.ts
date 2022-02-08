import { LicensingResponse } from './shared';
import { Api } from './api/Api';
import RequestStorage from './RequestStorage';
import EthereumManager from './EthereumManager';

const defaultPreamble = `Please sign this message to verify your ownership of the wallet.
After verifying your ownership, we are able to verify that your wallet contains the necessary license NFT to use this software.
`;

/**
 * NFTLicense Library
 * License your software based on NFTs
 */
export default class NFTLicense {
  private requestStorage = new RequestStorage();
  private ethereumManager = new EthereumManager();

  constructor(private api: Api, private preamble = defaultPreamble) {}

  /**
   * Validate that the user returning a licensing response has a valid license
   *
   * @param licensingResponse Answer of a licensing response sent to the user
   */
  public async validateLicensingResponse(
    licensingResponse: LicensingResponse
  ): Promise<boolean> {
    if (!this.requestStorage.validateLicensingResponse(licensingResponse)) {
      return false;
    }

    const licensingRequest = this.requestStorage.extractLicensingRequestById(
      licensingResponse.requestId
    );
    if (!licensingRequest) {
      return false;
    }

    if (
      !this.ethereumManager.verifyLicensingRequestSignature(
        licensingRequest,
        licensingResponse
      )
    ) {
      return false;
    }

    return await this.api.hasValidLicense(licensingResponse.publicAddress!);
  }

  public createLicensingRequest() {
    return this.requestStorage.createLicensingRequest(this.preamble);
  }
}
