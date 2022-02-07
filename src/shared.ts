export type Challenge = {
  id: string;
  message: string;
};
export type ChallengeAnswer = {
  challengeId: string;
  publicAddress?: string;
  answerMessage?: string;
};
