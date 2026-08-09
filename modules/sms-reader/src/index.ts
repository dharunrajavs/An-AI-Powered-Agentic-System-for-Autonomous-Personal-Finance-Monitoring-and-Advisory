import { NativeModules, Platform } from 'react-native';

const { SmsReader } = NativeModules;

export interface SmsReaderInterface {
  requestPermission(): Promise<boolean>;
  readSms(options: { maxCount?: number; filter?: string[] }): Promise<{ body: string; sender: string }[]>;
  getScanProgress(): Promise<{ step: string; progress: number }>;
}

const Stub: SmsReaderInterface = {
  async requestPermission() { return false; },
  async readSms() { return []; },
  async getScanProgress() { return { step: 'preparing', progress: 1 }; },
};

export const SmsReaderModule: SmsReaderInterface =
  Platform.OS === 'android' && SmsReader ? SmsReader : Stub;

export default SmsReaderModule;
