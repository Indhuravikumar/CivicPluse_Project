import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  ward?: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  department?: mongoose.Types.ObjectId;
  trustScore: number;
  reportsCount: number;
  resolvedCount: number;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['citizen', 'officer', 'admin'], default: 'citizen' },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    ward: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    reportsCount: { type: Number, default: 0 },
    resolvedCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
