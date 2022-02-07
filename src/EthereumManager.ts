import { recoverPersonalSignature } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';
import { Challenge, ChallengeAnswer } from './shared';

export default class EthereumManager {
  verifyChallengeSignature(challenge: Challenge, answer: ChallengeAnswer) {
    const msgBufferHex = bufferToHex(Buffer.from(challenge.message, 'utf8'));
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: answer.answerMessage!,
    });

    return address.toLowerCase() === answer.publicAddress!.toLowerCase();
  }
}
