import mongoose, { Document, Schema } from 'mongoose';

export type IssueStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory =
  | 'Pothole' | 'Garbage' | 'Drainage' | 'Streetlight'
  | 'Water Leakage' | 'Road Damage' | 'Fallen Tree'
  | 'Broken Footpath' | 'Traffic Signal' | 'Encroachment' | 'Other';

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
  resolvedBy?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  resolutionEvidence?: string[];
  slaDue?: Date;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineSchema = new Schema<ITimelineEntry>({
  status: { type: String, required: true },
  message: { type: String, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      required: true,
      enum: ['Pothole','Garbage','Drainage','Streetlight','Water Leakage','Road Damage',
             'Fallen Tree','Broken Footpath','Traffic Signal','Encroachment','Other'],
    },
    status: {
      type: String,
      enum: ['pending','assigned','in_progress','resolved','closed','rejected'],
      default: 'pending',
    },
    severity: { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
    priorityScore: { type: Number, default: 50, min: 0, max: 100 },
    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
      ward: String,
      city: String,
    },
    images: [{ type: String }],
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    timeline: [TimelineSchema],
    aiAnalysis: {
      confidence: Number,
      detectedCategory: String,
      spamProbability: Number,
      duplicateProbability: Number,
      suggestedDepartment: String,
    },
    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      resolutionQuality: String,
      notes: String,
    },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    duplicateOf: { type: Schema.Types.ObjectId, ref: 'Issue' },
    isDuplicate: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: String,
    resolutionEvidence: [{ type: String }],
    slaDue: Date,
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

IssueSchema.index({ status: 1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ reportedBy: 1 });
IssueSchema.index({ department: 1 });
IssueSchema.index({ 'location.lat': 1, 'location.lng': 1 });
IssueSchema.index({ priorityScore: -1 });
IssueSchema.index({ createdAt: -1 });
IssueSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IIssue>('Issue', IssueSchema);
