"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("../controllers/department.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', department_controller_1.getDepartments);
router.get('/:id', department_controller_1.getDepartment);
router.get('/:id/officers', auth_1.protect, department_controller_1.getDepartmentOfficers);
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin'), department_controller_1.createDepartment);
router.patch('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), department_controller_1.updateDepartment);
exports.default = router;
//# sourceMappingURL=department.routes.js.map