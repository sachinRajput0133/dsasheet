export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Topic {
  _id: string;
  title: string;
  description: string;
  order: number;
}

export interface Problem {
  _id: string;
  topicId: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  youtubeLink?: string;
  codingLink?: string;
  articleLink?: string;
  description?: string;
  order: number;
}

export interface ProgressStats {
  total: number;
  completed: number;
  percentage: number;
}

export interface TopicStat {
  _id: string;
  completedCount: number;
}

// Wrapper from transform interceptor
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface PaginatedProblems {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
