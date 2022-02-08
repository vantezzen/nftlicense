export type LicensingRequest = {
  id: string;
  message: string;
};
export type LicensingResponse = {
  requestId: string;
  publicAddress?: string;
  answerMessage?: string;
};
