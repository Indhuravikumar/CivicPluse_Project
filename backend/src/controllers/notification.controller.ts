import { Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await Notification.find({ user: req.user!._id })
      .sort({ createdAt: -1 }).limit(50).populate('issue', 'title status');
    const unreadCount = await Notification.countDocuments({ user: req.user!._id, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) { next(err); }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notif = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user!._id }, { isRead: true }, { new: true });
    if (!notif) { res.status(404).json({ success: false, message: 'Notification not found' }); return; }
    res.json({ success: true, data: notif });
  } catch (err) { next(err); }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};
