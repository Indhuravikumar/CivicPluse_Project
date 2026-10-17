import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);
// IMPORTANT: 'read-all' must come BEFORE '/:id/read' to avoid Express matching 'read-all' as an id
router.patch('/read-all', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);

export default router;
