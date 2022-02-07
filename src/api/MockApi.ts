import { Api } from './Api';

export default class MockApi implements Api {
  async hasValidLicense(address: string): Promise<boolean> {
    return true;
  }
}
