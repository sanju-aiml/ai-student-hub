export type AIProvider = 'local_ollama' | 'remote_ollama' | 'openai' | 'gemini_backend' | 'litellm' | 'vllm' | 'lm_studio' | 'localai' | 'llamacpp' | 'custom_rest';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  url: string;
  apiKey: string;
  modelName: string;
  priority: number;
  isActive: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currentGrade: string;
  major: string;
  xp: number;
  badges: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  generatedImage?: string;
  generatedDoc?: {
    docType: 'word' | 'excel' | 'ppt';
    title: string;
    data: any;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  provider: AIProvider;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'study' | 'exam' | 'assignment' | 'personal';
  pomodorosSpent: number;
  pomodorosEstimated: number;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'exam' | 'deadline' | 'study_group' | 'reminder';
  description: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

export interface AppProject {
  id: string;
  name: string;
  description: string;
  files: CodeFile[];
  createdAt: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'BLOCKED';
  details: string;
}
