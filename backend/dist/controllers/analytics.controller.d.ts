import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboardStats: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategoryStats: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getStatusStats: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTrends: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDepartmentPerformance: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getHeatmapData: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getSeverityStats: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=analytics.controller.d.ts.map