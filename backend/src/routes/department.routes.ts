import { Router } from 'express';
import {
  getDepartments, getDepartment, createDepartment,
  updateDepartment, getDepartmentOfficers,
} from '../controllers/department.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.get('/:id/officers', protect, getDepartmentOfficers);
router.post('/', protect, authorize('admin'), createDepartment);
router.patch('/:id', protect, authorize('admin'), updateDepartment);

export default router;
