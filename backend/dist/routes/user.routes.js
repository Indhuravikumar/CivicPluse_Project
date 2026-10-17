"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.protect, (0, auth_1.authorize)('admin'), user_controller_1.getUsers);
router.get('/:id', auth_1.protect, user_controller_1.getUser);
router.patch('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), user_controller_1.updateUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map