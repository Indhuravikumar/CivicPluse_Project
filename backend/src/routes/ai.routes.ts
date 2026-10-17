import { Router } from 'express';
import { analyzeText, analyzeImage, checkDuplicate, getInsights, calculatePriority } from '../controllers/ai.controller';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/analyze-text', protect, analyzeText);
router.post('/analyze-image', protect, upload.single('file'), analyzeImage);
router.post('/check-duplicate', protect, checkDuplicate);
router.post('/calculate-priority', protect, calculatePriority);
router.get('/insights', protect, getInsights);

export default router;
