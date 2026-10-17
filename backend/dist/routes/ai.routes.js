"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/analyze-text', auth_1.protect, ai_controller_1.analyzeText);
router.post('/analyze-image', auth_1.protect, upload_1.upload.single('file'), ai_controller_1.analyzeImage);
router.post('/check-duplicate', auth_1.protect, ai_controller_1.checkDuplicate);
router.post('/calculate-priority', auth_1.protect, ai_controller_1.calculatePriority);
router.get('/insights', auth_1.protect, ai_controller_1.getInsights);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map