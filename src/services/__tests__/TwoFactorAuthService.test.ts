import { describe, it, expect, beforeEach } from 'vitest';
import TwoFactorAuthService from '@/services/TwoFactorAuthService';

describe('TwoFactorAuthService', () => {
  const userId = 'test-user';

  beforeEach(() => {
    // Clear 2FA state
    TwoFactorAuthService['userSecrets'] = new Map();
    TwoFactorAuthService['backupCodes'] = new Map();
  });

  it('should generate TOTP secret', () => {
    const result = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    
    expect(result.secret).toBeTruthy();
    expect(result.secret.length).toBeGreaterThan(10);
    expect(result.qrCode).toContain('otpauth://totp/');
    expect(result.manualEntry).toBeTruthy();
  });

  it('should setup 2FA with valid code', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    
    // Generate current TOTP code
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    const setup = TwoFactorAuthService.setup(userId, code);
    expect(setup.success).toBe(true);
    expect(setup.backupCodes).toHaveLength(10);
    expect(setup.enabled).toBe(false); // Not enabled until explicitly enabled
  });

  it('should fail setup with invalid code', () => {
    TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    
    const setup = TwoFactorAuthService.setup(userId, '000000');
    expect(setup.success).toBe(false);
    expect(setup.backupCodes).toBeUndefined();
  });

  it('should enable 2FA', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    TwoFactorAuthService.setup(userId, code);
    const result = TwoFactorAuthService.enable(userId);
    
    expect(result).toBe(true);
    expect(TwoFactorAuthService.isEnabled(userId)).toBe(true);
  });

  it('should verify valid TOTP code', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    TwoFactorAuthService.setup(userId, code);
    TwoFactorAuthService.enable(userId);
    
    // Generate fresh code
    const newCode = TwoFactorAuthService['generateTOTP'](secret);
    const result = TwoFactorAuthService.verify(userId, newCode);
    
    expect(result.success).toBe(true);
    expect(result.method).toBe('totp');
  });

  it('should verify valid backup code', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    const setup = TwoFactorAuthService.setup(userId, code);
    TwoFactorAuthService.enable(userId);
    
    const backupCode = setup.backupCodes![0];
    const result = TwoFactorAuthService.verify(userId, backupCode);
    
    expect(result.success).toBe(true);
    expect(result.method).toBe('backup');
    expect(result.remainingBackupCodes).toBe(9);
  });

  it('should not allow reusing backup codes', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    const setup = TwoFactorAuthService.setup(userId, code);
    TwoFactorAuthService.enable(userId);
    
    const backupCode = setup.backupCodes![0];
    
    // First use should work
    const first = TwoFactorAuthService.verify(userId, backupCode);
    expect(first.success).toBe(true);
    
    // Second use should fail
    const second = TwoFactorAuthService.verify(userId, backupCode);
    expect(second.success).toBe(false);
  });

  it('should lock account after failed attempts', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    TwoFactorAuthService.setup(userId, code);
    TwoFactorAuthService.enable(userId);
    
    // Make 3 failed attempts
    for (let i = 0; i < 3; i++) {
      TwoFactorAuthService.verify(userId, '000000');
    }
    
    // 4th attempt should be locked
    const result = TwoFactorAuthService.verify(userId, '000000');
    expect(result.success).toBe(false);
    expect(result.locked).toBe(true);
  });

  it('should regenerate backup codes', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    const setup = TwoFactorAuthService.setup(userId, code);
    TwoFactorAuthService.enable(userId);
    
    const oldCodes = setup.backupCodes!;
    const newCodes = TwoFactorAuthService.regenerateBackupCodes(userId);
    
    expect(newCodes).toHaveLength(10);
    expect(newCodes[0]).not.toBe(oldCodes[0]);
  });

  it('should disable 2FA', () => {
    const { secret } = TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    const code = TwoFactorAuthService['generateTOTP'](secret);
    
    TwoFactorAuthService.setup(userId, code);
    TwoFactorAuthService.enable(userId);
    
    const disabled = TwoFactorAuthService.disable(userId);
    expect(disabled).toBe(true);
    expect(TwoFactorAuthService.isEnabled(userId)).toBe(false);
  });

  it('should get 2FA status', () => {
    TwoFactorAuthService.generateSecret(userId, 'test@example.com');
    
    const status = TwoFactorAuthService.getStatus(userId);
    expect(status.enabled).toBe(false);
    expect(status.hasSecret).toBe(true);
  });
});
