import { Request, Response } from 'express';
import User from '../models/User';
import Issue from '../models/Issue';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find().select('-password').populate('department', 'name code').lean() as any[];
  
  const reportedCounts = await Issue.aggregate([{ $group: { _id: '$reportedBy', count: { $sum: 1 } } }]);
  const reportedMap = new Map(reportedCounts.map(r => [String(r._id), r.count]));
  
  const assignedCounts = await Issue.aggregate([{ $group: { _id: '$assignedTo', count: { $sum: 1 } } }]);
  const assignedMap = new Map(assignedCounts.map(r => [String(r._id), r.count]));

  users.forEach(u => {
    if (u.role === 'citizen') {
      u.reportsCount = reportedMap.get(String(u._id)) || 0;
    } else if (u.role === 'officer') {
      u.reportsCount = assignedMap.get(String(u._id)) || 0;
    } else {
      u.reportsCount = 0;
    }
  });

  res.json({ success: true, data: users });
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select('-password').populate('department', 'name code');
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
  res.json({ success: true, data: user });
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role, department, isActive, isVerified } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, department, isActive, isVerified },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
  res.json({ success: true, data: user });
};
