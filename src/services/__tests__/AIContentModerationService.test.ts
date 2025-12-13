import { describe, it, expect } from 'vitest';
import AIContentModerationService from '@/services/AIContentModerationService';

describe('AIContentModerationService', () => {
  it('should detect Arabic profanity', () => {
    const result = AIContentModerationService.moderateText('كلب غبي');
    expect(result.action).toBe('FILTER');
    expect(result.filtered).toContain('***');
    expect(result.categories).toContain('PROFANITY');
  });

  it('should detect English profanity', () => {
    const result = AIContentModerationService.moderateText('You are stupid');
    expect(result.action).toBe('FILTER');
    expect(result.categories).toContain('PROFANITY');
  });

  it('should allow clean content', () => {
    const result = AIContentModerationService.moderateText('مرحباً كيف حالك؟');
    expect(result.action).toBe('ALLOW');
    expect(result.score).toBe(0);
  });

  it('should detect hate speech', () => {
    const result = AIContentModerationService.moderateText('I hate all Muslims');
    expect(result.action).toBe('BLOCK');
    expect(result.categories).toContain('HATE_SPEECH');
  });

  it('should detect sexual content', () => {
    const result = AIContentModerationService.moderateText('sex for sale');
    expect(result.action).toBe('FLAG');
    expect(result.categories).toContain('SEXUAL');
  });

  it('should detect violence', () => {
    const result = AIContentModerationService.moderateText('I will kill you');
    expect(result.action).toBe('BLOCK');
    expect(result.categories).toContain('VIOLENCE');
  });

  it('should detect spam', () => {
    const spamText = 'BUY NOW!!! CLICK HERE!!! www.spam.com FREE MONEY!!!';
    const result = AIContentModerationService.moderateText(spamText);
    expect(result.action).toBe('FILTER');
    expect(result.categories).toContain('SPAM');
  });

  it('should detect personal information', () => {
    const result = AIContentModerationService.moderateText(
      'My email is test@example.com and my phone is 966501234567'
    );
    expect(result.action).toBe('FLAG');
    expect(result.categories).toContain('PERSONAL_INFO');
  });

  it('should moderate URLs', () => {
    const result = AIContentModerationService.moderateURL('https://example.com');
    expect(result.action).toBe('ALLOW');

    const suspicious = AIContentModerationService.moderateURL('http://bit.ly/xyz');
    expect(suspicious.action).toBe('FLAG');
  });

  it('should respect whitelist', () => {
    AIContentModerationService.addToWhitelist('test-word');
    const result = AIContentModerationService.moderateText('test-word');
    expect(result.action).toBe('ALLOW');
  });

  it('should respect blacklist', () => {
    AIContentModerationService.addToBlacklist('banned-word');
    const result = AIContentModerationService.moderateText('banned-word here');
    expect(result.action).toBe('BLOCK');
    expect(result.score).toBeGreaterThan(0);
  });

  it('should handle multiple violations', () => {
    const text = 'stupid idiot violence sex spam!!! CLICK HERE';
    const result = AIContentModerationService.moderateText(text);
    expect(result.categories.length).toBeGreaterThan(2);
    expect(result.score).toBeGreaterThan(50);
  });

  it('should handle empty input', () => {
    const result = AIContentModerationService.moderateText('');
    expect(result.action).toBe('ALLOW');
    expect(result.score).toBe(0);
  });

  it('should provide detailed reasons', () => {
    const result = AIContentModerationService.moderateText('stupid content');
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons[0]).toBeTruthy();
  });
});
