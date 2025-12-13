/**
 * Services Index - تصدير جميع الخدمات
 */

// Existing Services
export { AuthService } from './AuthService';
export { NotificationService } from './NotificationService';
export { RecordingService } from './RecordingService';

// New Advanced Services
export { AdvancedSearchService } from './AdvancedSearchService';
export { ModerationService } from './ModerationService';
export { ChatHistoryService } from './ChatHistoryService';
export { TranslationService } from './TranslationService';

// Types
export type { 
  SearchFilters, 
  SearchResult 
} from './AdvancedSearchService';

export type {
  BlockedUser,
  MutedUser,
  Report,
  ReportReason
} from './ModerationService';

export type {
  ChatHistory,
  PaginationOptions,
  PaginatedResult
} from './ChatHistoryService';

export type {
  Translation,
  SupportedLanguage,
  TranslationSettings
} from './TranslationService';

export type {
  Recording,
  RecordingSettings
} from './RecordingService';
