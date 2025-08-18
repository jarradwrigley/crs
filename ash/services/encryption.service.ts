// services/encryptionService.ts
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

export class EncryptionService {
  /**
   * Encrypt sensitive user data
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }

  /**
   * Decrypt user data
   */
  static decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encrypted = textParts.join(":");

    const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Encrypt user sensitive data as JSON
   */
  static encryptUserData(userData: {
    fullName: string;
    address: string;
    phoneNumber: string;
  }): string {
    const dataString = JSON.stringify(userData);
    return this.encrypt(dataString);
  }

  /**
   * Decrypt user data and return as object
   */
  static decryptUserData(encryptedData: string): {
    fullName: string;
    address: string;
    phoneNumber: string;
  } {
    const decryptedString = this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  }

  /**
   * Generate a secure hash for verification
   */
  static generateHash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify hash
   */
  static verifyHash(data: string, hash: string): boolean {
    const computedHash = this.generateHash(data);
    return computedHash === hash;
  }
}
