import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description: string;
  categories: string[];
  headOfficer?: mongoose.Types.ObjectId;
  contactEmail: string;
  contactPhone?: string;
  slaHours: number;
  isActive: boolean;
  totalAssigned: number;
  totalResolved: number;
  avgResolutionHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, trim: true },
    categories: [{ type: String }],
    headOfficer: { type: Schema.Types.ObjectId, ref: 'User' },
    contactEmail: { type: String, required: true, lowercase: true },
    contactPhone: { type: String },
    slaHours: { type: Number, default: 72 },
    isActive: { type: Boolean, default: true },
    totalAssigned: { type: Number, default: 0 },
    totalResolved: { type: Number, default: 0 },
    avgResolutionHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
