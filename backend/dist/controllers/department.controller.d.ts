import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDepartments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDepartment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createDepartment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateDepartment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDepartmentOfficers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=department.controller.d.ts.map