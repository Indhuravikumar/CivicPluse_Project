import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map