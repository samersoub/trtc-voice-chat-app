import { describe, it, expect, beforeEach } from 'vitest';
import E2EEncryptionService from '@/services/E2EEncryptionService';

describe('E2EEncryptionService', () => {
  const userId = 'test-user';

  beforeEach(async () => {
    // Generate fresh keys for each test
    await E2EEncryptionService.generateKeyPair(userId);
  });

  it('should generate RSA key pair', async () => {
    const hasKeys = await E2EEncryptionService.hasKeyPair(userId);
    expect(hasKeys).toBe(true);

    const publicKey = await E2EEncryptionService.getPublicKey(userId);
    expect(publicKey).toBeTruthy();
    expect(typeof publicKey).toBe('string');
  });

  it('should encrypt and decrypt messages', async () => {
    const originalMessage = 'مرحباً، هذه رسالة سرية!';
    const recipientId = 'recipient-user';

    // Generate keys for recipient
    await E2EEncryptionService.generateKeyPair(recipientId);

    // Encrypt
    const encrypted = await E2EEncryptionService.encryptMessage(
      originalMessage,
      userId,
      recipientId
    );

    expect(encrypted.encryptedData).toBeTruthy();
    expect(encrypted.encryptedKey).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();

    // Decrypt
    const decrypted = await E2EEncryptionService.decryptMessage(
      encrypted,
      recipientId
    );

    expect(decrypted).toBe(originalMessage);
  });

  it('should fail decryption with wrong key', async () => {
    const originalMessage = 'Secret message';
    const recipientId = 'recipient-user';
    const wrongUserId = 'wrong-user';

    await E2EEncryptionService.generateKeyPair(recipientId);
    await E2EEncryptionService.generateKeyPair(wrongUserId);

    const encrypted = await E2EEncryptionService.encryptMessage(
      originalMessage,
      userId,
      recipientId
    );

    // Try to decrypt with wrong user's key
    await expect(
      E2EEncryptionService.decryptMessage(encrypted, wrongUserId)
    ).rejects.toThrow();
  });

  it('should export and import keys', async () => {
    const publicKey = await E2EEncryptionService.getPublicKey(userId);
    const exported = await E2EEncryptionService.exportKeys(userId);

    expect(exported).toHaveProperty('publicKey');
    expect(exported).toHaveProperty('privateKey');
    expect(exported.publicKey).toBe(publicKey);

    // Clear and import
    await E2EEncryptionService.deleteKeyPair(userId);
    await E2EEncryptionService.importKeys(userId, exported);

    const hasKeys = await E2EEncryptionService.hasKeyPair(userId);
    expect(hasKeys).toBe(true);
  });

  it('should encrypt generic data', async () => {
    const data = { secret: 'value', number: 42 };

    const encrypted = await E2EEncryptionService.encryptData(
      JSON.stringify(data),
      userId
    );

    expect(encrypted.encryptedData).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();

    const decrypted = await E2EEncryptionService.decryptData(encrypted, userId);
    const parsed = JSON.parse(decrypted);

    expect(parsed).toEqual(data);
  });

  it('should handle key rotation', async () => {
    const oldPublicKey = await E2EEncryptionService.getPublicKey(userId);

    // Generate new keys
    await E2EEncryptionService.generateKeyPair(userId);
    const newPublicKey = await E2EEncryptionService.getPublicKey(userId);

    expect(newPublicKey).not.toBe(oldPublicKey);
  });

  it('should handle missing keys gracefully', async () => {
    const nonExistentUser = 'non-existent';

    await expect(
      E2EEncryptionService.getPublicKey(nonExistentUser)
    ).rejects.toThrow();

    const hasKeys = await E2EEncryptionService.hasKeyPair(nonExistentUser);
    expect(hasKeys).toBe(false);
  });
});
