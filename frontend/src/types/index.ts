export type UserRole = 'citizen' | 'officer' | 'admin';
export type IssueStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  ward?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  department?: Department | string;
  trustScore: number;
  reportsCount: number;
  resolvedCount: number;
  lastLogin?: string;
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  categories: string[];
  headOfficer?: User;
  contactEmail: string;
  contactPhone?: string;
  slaHours: number;
  isActive: boolean;
  totalAssigned: number;
  totalResolved: number;
}

export interface TimelineEntry {
  status: string;
  message: string;
  updatedBy?: Partial<User>;
  timestamp: string;
}

export interface AIAnalysis {
  confidence: number;
  detectedCategory: string;
  spamProbability: number;
  duplicateProbability: number;
  suggestedDepartment: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: IssueStatus;
  severity: IssueSeverity;
  priorityScore: number;
  location: {
    address: string;
    lat: number;
    lng: number;
    ward?: string;
    city?: string;
  };
  images: string[];
  reportedBy: Partial<User>;
  assignedTo?: Partial<User>;
  department?: Partial<Department>;
  timeline: TimelineEntry[];
  aiAnalysis?: AIAnalysis;
  verification?: {
    isVerified: boolean;
    verifiedAt?: string;
    resolutionQuality?: string;
    notes?: string;
  };
  upvotes: string[];
  isDuplicate: boolean;
  isSpam: boolean;
  resolvedAt?: string;
  resolvedBy?: Partial<User> | string;
  resolutionNotes?: string;
  resolutionEvidence?: string[];
  slaDue?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'update';
  isRead: boolean;
  issue?: Partial<Issue>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  inProgressIssues: number;
  totalUsers: number;
  totalDepts: number;
  resolutionRate: number;
}

export interface TrendData {
  _id: string;
  reported: number;
  resolved: number;
}

export interface CategoryStat {
  _id: string;
  count: number;
  resolved: number;
}

export interface DeptPerformance {
  _id: string;
  name: string;
  code: string;
  total: number;
  resolved: number;
  avgPriority: number;
  resolutionRate: number;
}
