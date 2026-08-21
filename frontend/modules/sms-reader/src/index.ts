import { NativeModules, Platform } from 'react-native';

const { SmsReader } = NativeModules;

export interface SmsReaderInterface {
  checkPermission(): Promise<{ granted: boolean; canRequest: boolean }>;
  requestPermission(): Promise<boolean>;
  readSms(options: { maxCount?: number; filter?: string[] }): Promise<{ body: string; sender: string }[]>;
  getScanProgress(): Promise<{ step: string; progress: number }>;
  startMonitoring(): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  isMonitoring(): Promise<boolean>;
}

const Stub: SmsReaderInterface = {
  async checkPermission() { return { granted: false, canRequest: false }; },
  async requestPermission() { return false; },
  async readSms() { return []; },
  async getScanProgress() { return { step: 'preparing', progress: 1 }; },
  async startMonitoring() { return false; },
  async stopMonitoring() { return true; },
  async isMonitoring() { return false; },
};

export const SmsReaderModule: SmsReaderInterface =
  Platform.OS === 'android' && SmsReader ? SmsReader : Stub;

export default SmsReaderModule;