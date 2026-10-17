import mongoose, { Document } from 'mongoose';
export type IssueStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'Pothole' | 'Garbage' | 'Drainage' | 'Streetlight' | 'Water Leakage' | 'Road Damage' | 'Fallen Tree' | 'Broken Footpath' | 'Traffic Signal' | 'Encroachment' | 'Other';
export interface ITimelineEntry {
    status: string;
    message: string;
    updatedBy?: mongoose.Types.ObjectId;
    timestamp: Date;
}
export interface IIssue extends Document {
    title: string;
    description: string;
    category: IssueCategory;
    status: IssueStatus;
    severity: IssueSeverity;
    priorityScore: number;
    location: {
        address: string;
        lat: number;
        lng: number;
        ward?: string;
        city?: string;
    };
    images: string[];
    reportedBy: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    department?: mongoose.Types.ObjectId;
    timeline: ITimelineEntry[];
    aiAnalysis?: {
        confidence: number;
        detectedCategory: string;
        spamProbability: number;
        duplicateProbability: number;
        suggestedDepartment: string;
    };
    verification?: {
        isVerified: boolean;
        verifiedBy?: mongoose.Types.ObjectId;
        verifiedAt?: Date;
        resolutionQuality?: string;
        notes?: string;
    };
    upvotes: mongoose.Types.ObjectId[];
    duplicateOf?: mongoose.Types.ObjectId;
    isDuplicate: boolean;
    isSpam: boolean;
    resolvedAt?: Date;
    slaDue?: Date;
    language: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IIssue, {}, {}, {}, mongoose.Document<unknown, {}, IIssue, {}, {}> & IIssue & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Issue.d.ts.map