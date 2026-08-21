import { delay } from './delay';
import { USE_MOCK } from '../config';
import {
  signUp as apiSignUp,
  signIn as apiSignIn,
  signOut as apiSignOut,
  getCurrentSession as apiGetSession,
  signInWithGoogle as apiGoogle,
  signInWithFacebook as apiFacebook,
  signInWithApple as apiApple,
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
} from '../api/auth';

let persistedUser: { email: string; name: string } | null = null;

export async function signUp(email: string, password: string, name: string) {
  if (!USE_MOCK) return apiSignUp(email, password, name);
  await delay(null, 600);
  persistedUser = { email, name };
  return { user: { id: 'mock_user_id', email } };
}

export async function signIn(email: string, password: string) {
  if (!USE_MOCK) return apiSignIn(email, password);
  await delay(null, 400);
  return { user: { id: 'mock_user_id', email } };
}

export async function signOut() {
  if (!USE_MOCK) return apiSignOut();
  await delay(null, 200);
  persistedUser = null;
}

export async function getCurrentSession() {
  if (!USE_MOCK) return apiGetSession();
  await delay(null, 100);
  return persistedUser ? { user: { id: 'mock_user_id', email: persistedUser.email } } : null;
}

export async function signInWithGoogle() {
  if (!USE_MOCK) return apiGoogle();
  await delay(null, 800);
  return {
    user: { id: 'mock_google_user', email: 'user@gmail.com' },
    provider: 'google',
  };
}

export async function signInWithFacebook() {
  if (!USE_MOCK) return apiFacebook();
  await delay(null, 800);
  return {
    user: { id: 'mock_fb_user', email: 'user@facebook.com' },
    provider: 'facebook',
  };
}

export async function signInWithApple() {
  if (!USE_MOCK) return apiApple();
  await delay(null, 800);
  return {
    user: { id: 'mock_apple_user', email: 'user@icloud.com' },
    provider: 'apple',
  };
}

const otpStore: Record<string, string> = {};

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  if (!USE_MOCK) return apiSendOtp(phone);
  await delay(null, 1000);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = code;
  console.log(`[DEV] OTP for ${phone}: ${code}`);
  return { success: true, message: code };
}

export async function verifyOtp(phone: string, otp: string, name?: string, email?: string): Promise<{ success: boolean; message: string; user?: any; session?: any }> {
  if (!USE_MOCK) return apiVerifyOtp(phone, otp, name ?? '', email ?? '');
  await delay(null, 800);
  const stored = otpStore[phone];
  const isValid = stored === otp || otp === '123456';
  if (isValid) delete otpStore[phone];
  return {
    success: isValid,
    message: isValid ? 'Phone verified successfully' : 'Invalid OTP',
  };
}
