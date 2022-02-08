import { v4 as uuid } from 'uuid';

import { LicensingRequest, LicensingResponse } from './shared';

/**
 * LicensingRequestManager: Handles saving and retrieving licensing requests
 */
export default class RequestStorage {
  licensingRequests: LicensingRequest[] = [];

  /**
   * Get a licensing request to determine the user's wallet address
   * @returns LicensingRequest to send to the browser
   */
  public createLicensingRequest(preamble: string): LicensingRequest {
    const requestId = this.getUnusedLicensingRequestId();
    const licensingRequest: LicensingRequest = {
      id: requestId,
      message: preamble + '\n' + uuid(),
    };

    this.licensingRequests.push(licensingRequest);
    return licensingRequest;
  }

  private getUnusedLicensingRequestId() {
    let requestId = '';
    do {
      requestId = uuid();
    } while (
      this.licensingRequests.some((request) => request.id === requestId)
    );
    return requestId;
  }

  validateLicensingResponse(licensingResponse: LicensingResponse) {
    return !(
      typeof licensingResponse !== 'object' ||
      !licensingResponse.requestId ||
      !licensingResponse.answerMessage ||
      !licensingResponse.publicAddress
    );
  }

  extractLicensingRequestById(id: string): LicensingRequest | false {
    const licensingRequest = this.licensingRequests.find(
      (request) => request.id === id
    );
    if (!licensingRequest) {
      return false;
    }
    this.licensingRequests = this.licensingRequests.filter(
      (c) => c === licensingRequest
    );

    return licensingRequest;
  }
}
