"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issue_controller_1 = require("../controllers/issue.controller");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, issue_controller_1.getIssues);
router.get('/:id', auth_1.protect, issue_controller_1.getIssue);
router.post('/', auth_1.protect, upload_1.upload.array('images', 5), issue_controller_1.createIssue);
router.patch('/:id/status', auth_1.protect, (0, auth_1.authorize)('officer', 'admin'), issue_controller_1.updateIssueStatus);
router.patch('/:id/assignment', auth_1.protect, (0, auth_1.authorize)('officer', 'admin'), issue_controller_1.assignIssue);
router.post('/:id/upvote', auth_1.protect, issue_controller_1.upvoteIssue);
router.post('/:id/verify', auth_1.protect, (0, auth_1.authorize)('officer', 'admin'), issue_controller_1.verifyResolution);
router.delete('/:id', auth_1.protect, issue_controller_1.deleteIssue);
exports.default = router;
//# sourceMappingURL=issue.routes.js.map