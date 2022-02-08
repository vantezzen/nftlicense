import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import { LicensingRequest, LicensingResponse } from './shared';

export default class EthereumManager {
  verifyLicensingRequestSignature(
    licensingRequest: LicensingRequest,
    licensingResponse: LicensingResponse
  ) {
    const msgBufferHex = bufferToHex(
      Buffer.from(licensingRequest.message, 'utf8')
    );
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: licensingResponse.answerMessage!,
    });

    return (
      address.toLowerCase() === licensingResponse.publicAddress!.toLowerCase()
    );
  }
}
