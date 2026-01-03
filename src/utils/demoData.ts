/**
 * Demo Data Setup for User Presence System
 * This file simulates some users being in rooms for testing the follow/track feature
 */

import { UserPresenceService } from '@/services/UserPresenceService';

/**
 * Initialize demo data for testing
 * Call this in development to simulate users in rooms
 */
export const initializeDemoPresence = () => {
  // Simulate some users in different rooms
  UserPresenceService.setUserInRoom('user123', 'r1', 'وكالة (Batman)');
  UserPresenceService.setUserInRoom('user456', 'r2', 'وكالة أسود حلب');
  UserPresenceService.setUserInRoom('user789', 'r3', 'وكالة تعز الحالمة');
  
  console.log('✅ Demo user presence initialized');
  console.log('- user123 is in room r1 (Batman)');
  console.log('- user456 is in room r2 (حلب)');
  console.log('- user789 is in room r3 (تعز)');
};

/**
 * Clear all demo data
 */
export const clearDemoPresence = () => {
  UserPresenceService.clearAll();
  console.log('🧹 Demo user presence cleared');
};
