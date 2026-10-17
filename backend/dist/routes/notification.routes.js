"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, notification_controller_1.getNotifications);
// IMPORTANT: 'read-all' must come BEFORE '/:id/read' to avoid Express matching 'read-all' as an id
router.patch('/read-all', auth_1.protect, notification_controller_1.markAllAsRead);
router.patch('/:id/read', auth_1.protect, notification_controller_1.markAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map