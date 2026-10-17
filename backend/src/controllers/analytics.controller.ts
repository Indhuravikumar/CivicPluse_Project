import { Response, NextFunction } from 'express';
import Issue from '../models/Issue';
import User from '../models/User';
import Department from '../models/Department';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalIssues, pendingIssues, resolvedIssues, criticalIssues, totalUsers, totalDepts, inProgressIssues] =
      await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ status: { $in: ['pending', 'assigned'] } }),
        Issue.countDocuments({ status: { $in: ['resolved', 'closed'] } }),
        Issue.countDocuments({ severity: 'critical', status: { $nin: ['resolved', 'closed'] } }),
        User.countDocuments({ role: 'citizen' }),
        Department.countDocuments({ isActive: true }),
        Issue.countDocuments({ status: 'in_progress' }),
      ]);
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
    res.json({ success: true, data: { totalIssues, pendingIssues, resolvedIssues, criticalIssues, inProgressIssues, totalUsers, totalDepts, resolutionRate } });
  } catch (err) { next(err); }
};

export const getCategoryStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

export const getStatusStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

export const getTrends = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);
    const trends = await Issue.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, reported: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data: trends });
  } catch (err) { next(err); }
};

export const getDepartmentPerformance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const matchStage: any = { department: { $exists: true } };
    if (req.user?.role === 'officer' && req.user.department) {
      matchStage.department = req.user.department;
    }
    const stats = await Issue.aggregate([
      { $match: matchStage },
      { $group: { _id: '$department', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } }, avgPriority: { $avg: '$priorityScore' } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$dept.name', code: '$dept.code', total: 1, resolved: 1, avgPriority: { $round: ['$avgPriority', 1] }, resolutionRate: { $round: [{ $multiply: [{ $divide: ['$resolved', { $max: ['$total', 1] }] }, 100] }, 1] } } },
      { $sort: { resolutionRate: -1 } },
    ]);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

export const getHeatmapData = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Issue.find(
      { 'location.lat': { $exists: true }, status: { $nin: ['closed'] } },
      { 'location.lat': 1, 'location.lng': 1, severity: 1, category: 1, priorityScore: 1 }
    ).limit(500).lean();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getSeverityStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Issue.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

export const getOfficerStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'officer') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }
    
    const [assignedIssues, pendingIssues, resolvedIssues, inProgressIssues] =
      await Promise.all([
        Issue.countDocuments({ assignedTo: req.user._id }),
        Issue.countDocuments({ assignedTo: req.user._id, status: { $in: ['pending', 'assigned'] } }),
        Issue.countDocuments({ assignedTo: req.user._id, status: { $in: ['resolved', 'closed'] } }),
        Issue.countDocuments({ assignedTo: req.user._id, status: 'in_progress' }),
      ]);
      
    res.json({ success: true, data: { assignedIssues, pendingIssues, resolvedIssues, inProgressIssues } });
  } catch (err) { next(err); }
};
