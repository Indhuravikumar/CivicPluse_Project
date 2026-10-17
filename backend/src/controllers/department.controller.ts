import { Request, Response, NextFunction } from 'express';
import Department from '../models/Department';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const depts = await Department.find({ isActive: true })
      .populate('headOfficer', 'name email')
      .lean();
    res.json({ success: true, data: depts });
  } catch (err) { next(err); }
};

export const getDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dept = await Department.findById(req.params.id).populate('headOfficer', 'name email');
    if (!dept) { res.status(404).json({ success: false, message: 'Department not found' }); return; }
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

export const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive } = req.body;
    const dept = await Department.create({
      name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive
    });
    res.status(201).json({ success: true, data: dept });
  } catch (err) { next(err); }
};

export const updateDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive } = req.body;
    const updates = { name, code, description, categories, contactEmail, contactPhone, slaHours, headOfficer, isActive };
    // Remove undefined fields
    Object.keys(updates).forEach(key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]);
    
    const dept = await Department.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!dept) { res.status(404).json({ success: false, message: 'Department not found' }); return; }
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

export const getDepartmentOfficers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const officers = await User.find({ department: req.params.id, role: 'officer', isActive: true }).select('-password');
    res.json({ success: true, data: officers });
  } catch (err) { next(err); }
};
