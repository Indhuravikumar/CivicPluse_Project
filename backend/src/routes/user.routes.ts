import { Router } from 'express';
import { getUsers, getUser, updateUser } from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, getUser);
router.patch('/:id', protect, authorize('admin'), updateUser);

export default router;
