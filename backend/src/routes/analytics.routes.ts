import { Router } from 'express';
import {
  getDashboardStats, getCategoryStats, getStatusStats,
  getTrends, getDepartmentPerformance, getHeatmapData, getSeverityStats,
  getOfficerStats
} from '../controllers/analytics.controller';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/categories', protect, getCategoryStats);
router.get('/status', protect, getStatusStats);
router.get('/trends', protect, getTrends);
router.get('/departments', protect, authorize('officer', 'admin'), getDepartmentPerformance);
router.get('/heatmap', protect, getHeatmapData);
router.get('/severity', protect, getSeverityStats);
router.get('/officer', protect, authorize('officer'), getOfficerStats);

export default router;
