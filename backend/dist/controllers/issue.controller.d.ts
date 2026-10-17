import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getIssues: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getIssue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createIssue: (req: AuthRequest, res: Response, next: import("express").NextFunction) => Promise<void>;
export declare const updateIssueStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const upvoteIssue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteIssue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const verifyResolution: (req: AuthRequest, res: Response) => Promise<void>;
export declare const assignIssue: (req: AuthRequest, res: Response, next: import("express").NextFunction) => Promise<void>;
//# sourceMappingURL=issue.controller.d.ts.map