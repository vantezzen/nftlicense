import { ChallengeAnswer } from './shared';
import { Api } from './api/Api';
import ChallengeStorage from './ChallengeStorage';
import EthereumManager from './EthereumManager';

const defaultPreamble = `Please sign this message to verify your ownership of the wallet.
After verifying your ownership, we are able to verify that your wallet contains the necessary license NFT to use this software.
`;

/**
 * NFTLicense Library
 * License your software based on NFTs
 */
export default class NFTLicense {
  private challengeStorage = new ChallengeStorage();
  private ethereumManager = new EthereumManager();

  constructor(private api: Api, private preamble = defaultPreamble) {}

  /**
   * Validate that the user returning a challenge answer has a valid license
   *
   * @param challengeAnswer Answer of a challenge sent to the user
   */
  public async validateLicenseWithChallenge(
    challengeAnswer: ChallengeAnswer
  ): Promise<boolean> {
    if (!this.challengeStorage.validateChallengeAnswer(challengeAnswer)) {
      return false;
    }

    const challenge = this.challengeStorage.extractChallengeById(
      challengeAnswer.challengeId
    );
    if (!challenge) {
      return false;
    }

    if (
      !this.ethereumManager.verifyChallengeSignature(challenge, challengeAnswer)
    ) {
      return false;
    }

    return await this.api.hasValidLicense(challengeAnswer.publicAddress!);
  }

  public getChallenge() {
    return this.challengeStorage.getChallenge(this.preamble);
  }
}
