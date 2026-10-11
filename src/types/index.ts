export interface GeneratorScore {
  name: string;
  score: number;
}

export interface DetectionOutput {
  ai_score: number;
  label: 'ai' | 'human';
  top_generator: string;
  generator_scores: GeneratorScore[];
  provider?: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  aiScore: number;
  label: 'ai' | 'human';
  topGenerator: string;
  generatorScores: GeneratorScore[];
  createdAt: number;
  provider?: string;
}

export interface UserNotificationPreferences {
  emailScanResults: boolean;
  emailProductUpdates: boolean;
  securityAlerts: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: UserNotificationPreferences;
}

export type NavigationTab =
  | 'dashboard'
  | 'upload'
  | 'history'
  | 'insight'
  | 'profile';
