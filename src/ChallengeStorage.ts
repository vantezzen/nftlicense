import { v4 as uuid } from 'uuid';

import { Challenge, ChallengeAnswer } from './shared';

/**
 * ChallengeManager: Handles saving and retrieving challenges
 */
export default class ChallengeStorage {
  challenges: Challenge[] = [];

  /**
   * Get a challenge to determine the user's wallet address
   * @returns Challenge to send to the browser
   */
  public getChallenge(preamble: string): Challenge {
    const challengeId = this.getUnusedChallengeId();
    const challenge: Challenge = {
      id: challengeId,
      message: preamble + '\n' + uuid(),
    };

    this.challenges.push(challenge);
    return challenge;
  }

  private getUnusedChallengeId() {
    let challengeId = '';
    do {
      challengeId = uuid();
    } while (this.challenges.some((challenge) => challenge.id === challengeId));
    return challengeId;
  }

  validateChallengeAnswer(challengeAnswer: ChallengeAnswer) {
    return !(
      typeof challengeAnswer !== 'object' ||
      !challengeAnswer.challengeId ||
      !challengeAnswer.answerMessage ||
      !challengeAnswer.publicAddress
    );
  }

  extractChallengeById(id: string): Challenge | false {
    const challenge = this.challenges.find((challenge) => challenge.id === id);
    if (!challenge) {
      return false;
    }
    this.challenges = this.challenges.filter((c) => c === challenge);

    return challenge;
  }
}
