import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getUsers: (_req: Request, res: Response) => Promise<void>;
export declare const getUser: (req: Request, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map