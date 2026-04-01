import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';

/**
 * Security utility for the application.
 * Implements AES-256 encryption for sensitive data.
 */

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secure-key-32-chars-long!!!';

export const Security = {
  /**
   * Encrypts a string using AES-256.
   * @param text The text to encrypt.
   * @returns The encrypted string in Base64.
   */
  encrypt: (text: string): string => {
    try {
      return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  },

  /**
   * Decrypts an AES-256 encrypted string.
   * @param cipherText The encrypted string.
   * @returns The decrypted text.
   */
  decrypt: (cipherText: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return cipherText;
    }
  },

  /**
   * Sanitizes input to prevent XSS using DOMPurify.
   */
  sanitize: (text: string): string => {
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(text);
    }
    // Fallback for non-browser environments
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Generates a unique device key for IoT devices.
   */
  generateDeviceKey: (): string => {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
};
