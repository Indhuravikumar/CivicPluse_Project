"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_1.protect, analytics_controller_1.getDashboardStats);
router.get('/categories', auth_1.protect, analytics_controller_1.getCategoryStats);
router.get('/status', auth_1.protect, analytics_controller_1.getStatusStats);
router.get('/trends', auth_1.protect, analytics_controller_1.getTrends);
router.get('/departments', auth_1.protect, (0, auth_1.authorize)('officer', 'admin'), analytics_controller_1.getDepartmentPerformance);
router.get('/heatmap', auth_1.protect, analytics_controller_1.getHeatmapData);
router.get('/severity', auth_1.protect, analytics_controller_1.getSeverityStats);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map