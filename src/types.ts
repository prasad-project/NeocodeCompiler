import { User as FirebaseUser } from 'firebase/auth';

// Extend Firebase User type to include username
export interface ExtendedUser extends FirebaseUser {
  username?: string;
}

// Rest of the existing types
export interface Language {
  id: string;
  name: string;
  extension: string;
  version: string;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  language: string;
  version: string;
}

export interface PistonResponse {
  language: string;
  version: string;
  run: {
    output: string;
    stderr: string;
    code: number;
    signal: string | null;
  };
}

export interface EditorTheme {
  id: string;
  name: string;
  theme: string;
}

// AI-related types
export interface AIResponse {
  success: boolean;
  suggestion: string | null;
  error: string | null;
}

export interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  onInsertCode: (code: string) => void;
}

export type AIAssistanceMode = 'chat' | 'complete' | 'explain' | 'optimize' | 'debug';

// User and code snippet types
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  version?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  isPublic: boolean;
  likes: number;
  views: number;
  tags: string[];
  shareableLink?: string | null;
  // Additional creator information
  creatorName?: string | null;
  creatorPhotoURL?: string | null;
  creatorUsername?: string | null;
}

export interface CodeComment {
  id: string;
  snippetId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: Date;
}

export interface ShareableLink {
  id: string;
  snippetId: string;
  expiresAt: Date | null;
  accessCount: number;
}