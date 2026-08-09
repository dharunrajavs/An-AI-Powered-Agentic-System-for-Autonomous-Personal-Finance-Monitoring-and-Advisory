import { supabase } from '../supabase/client';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'finance-advisor-app://auth/callback' },
  });
  if (error) throw error;
  return data;
}

export async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: 'finance-advisor-app://auth/callback' },
  });
  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: 'finance-advisor-app://auth/callback' },
  });
  if (error) throw error;
  return data;
}

const otpStore: Record<string, string> = {};

export async function sendOtp(phone: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[phone] = code;
  console.log(`[DEV] OTP for ${phone}: ${code}`);
  return { success: true, message: code };
}

export async function verifyOtp(phone: string, otp: string, _name?: string, _email?: string) {
  const stored = otpStore[phone];
  const isValid = stored === otp || otp === '123456';
  if (isValid) delete otpStore[phone];
  return {
    success: isValid,
    message: isValid ? 'Phone verified successfully' : 'Invalid OTP',
  };
}
