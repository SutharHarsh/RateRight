import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_KEY is required in production');
}

export function encrypt(text: string): string {
  const key = ENCRYPTION_KEY ?? 'development-key-change-me';
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(ciphertext: string): string {
  const key = ENCRYPTION_KEY ?? 'development-key-change-me';
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
