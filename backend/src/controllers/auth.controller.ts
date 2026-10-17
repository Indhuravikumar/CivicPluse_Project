import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

const sendToken = (user: IUser, statusCode: number, res: Response): void => {
  const token = signToken(String(user._id));
  const userObj = user.toObject() as Record<string, unknown>;
  delete userObj.password;
  res.status(statusCode).json({ success: true, token, user: userObj });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, address, ward } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email and password are required' });
      return;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }
    const user = await User.create({ name, email: email.toLowerCase(), password, phone, address, ward, role: 'citizen' });
    sendToken(user, 201, res);
  } catch (err: unknown) {
    console.error('Register error:', err);
    const msg = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ success: false, message: msg });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account is deactivated' });
      return;
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
  } catch (err: unknown) {
    console.error('Login error:', err);
    const msg = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ success: false, message: msg });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).populate('department', 'name code');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, user });
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowed = ['name', 'phone', 'address', 'ward', 'avatar'];
    const updates: Record<string, unknown> = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const user = await User.findByIdAndUpdate(req.user?._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};
