import { describe, it, expect, beforeEach, vi } from 'vitest';
import RateLimitService from '@/services/RateLimitService';

describe('RateLimitService', () => {
  beforeEach(() => {
    // Clear rate limit state before each test
    RateLimitService['rateLimits'] = new Map();
    RateLimitService['blockedUsers'] = new Map();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within rate limit', () => {
    const result = RateLimitService.checkLimit('LOGIN', 'user1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // 5 max - 1 used
  });

  it('should block requests exceeding rate limit', () => {
    // Make 5 requests (max for LOGIN)
    for (let i = 0; i < 5; i++) {
      RateLimitService.checkLimit('LOGIN', 'user1');
    }

    // 6th request should be blocked
    const result = RateLimitService.checkLimit('LOGIN', 'user1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset limit after window expires', () => {
    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      RateLimitService.checkLimit('LOGIN', 'user1');
    }

    // Fast forward time beyond window (15 minutes + 1ms)
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    // Should allow new requests
    const result = RateLimitService.checkLimit('LOGIN', 'user1');
    expect(result.allowed).toBe(true);
  });

  it('should block user permanently', () => {
    RateLimitService.blockUser('user1', 'Abuse detected');
    const result = RateLimitService.checkLimit('LOGIN', 'user1');
    expect(result.allowed).toBe(false);
  });

  it('should reset user limits', () => {
    // Hit rate limit
    for (let i = 0; i < 6; i++) {
      RateLimitService.checkLimit('LOGIN', 'user1');
    }

    // Reset
    RateLimitService.resetLimit('LOGIN', 'user1');

    // Should allow again
    const result = RateLimitService.checkLimit('LOGIN', 'user1');
    expect(result.allowed).toBe(true);
  });

  it('should track different actions separately', () => {
    // Hit LOGIN limit
    for (let i = 0; i < 6; i++) {
      RateLimitService.checkLimit('LOGIN', 'user1');
    }

    // SEND_MESSAGE should still work
    const result = RateLimitService.checkLimit('SEND_MESSAGE', 'user1');
    expect(result.allowed).toBe(true);
  });

  it('should provide rate limit stats', () => {
    RateLimitService.checkLimit('LOGIN', 'user1');
    RateLimitService.checkLimit('SEND_MESSAGE', 'user1');

    const stats = RateLimitService.getStats('user1');
    expect(stats).toHaveProperty('LOGIN');
    expect(stats).toHaveProperty('SEND_MESSAGE');
    expect(stats.LOGIN.used).toBe(1);
  });
});
