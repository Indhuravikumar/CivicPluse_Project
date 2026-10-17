import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IDepartment, {}, {}, {}, mongoose.Document<unknown, {}, IDepartment, {}, {}> & IDepartment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Department.d.ts.map