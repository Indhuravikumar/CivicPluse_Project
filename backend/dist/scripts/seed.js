"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const Department_1 = __importDefault(require("../models/Department"));
const Issue_1 = __importDefault(require("../models/Issue"));
const Notification_1 = __importDefault(require("../models/Notification"));
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicpulse';
const departments = [
    { name: 'Roads & Infrastructure', code: 'ROADS', description: 'Manages road maintenance, potholes, and infrastructure', categories: ['Pothole', 'Road Damage', 'Broken Footpath'], contactEmail: 'roads@civicpulse.gov', slaHours: 48, contactPhone: '+91-9876543210' },
    { name: 'Sanitation Department', code: 'SANIT', description: 'Handles garbage collection and cleanliness', categories: ['Garbage', 'Encroachment'], contactEmail: 'sanitation@civicpulse.gov', slaHours: 24, contactPhone: '+91-9876543211' },
    { name: 'Water & Sewage Board', code: 'WATER', description: 'Water supply and sewage management', categories: ['Water Leakage', 'Drainage'], contactEmail: 'water@civicpulse.gov', slaHours: 12, contactPhone: '+91-9876543212' },
    { name: 'Electricity Department', code: 'ELECT', description: 'Streetlights and electrical infrastructure', categories: ['Streetlight'], contactEmail: 'electricity@civicpulse.gov', slaHours: 24, contactPhone: '+91-9876543213' },
    { name: 'Parks & Environment', code: 'PARKS', description: 'Green spaces and environmental management', categories: ['Fallen Tree'], contactEmail: 'parks@civicpulse.gov', slaHours: 72, contactPhone: '+91-9876543214' },
    { name: 'Traffic Management Cell', code: 'TRAFF', description: 'Traffic signals and road safety', categories: ['Traffic Signal'], contactEmail: 'traffic@civicpulse.gov', slaHours: 6, contactPhone: '+91-9876543215' },
    { name: 'Urban Planning Department', code: 'URBAN', description: 'Urban development and encroachment removal', categories: ['Other'], contactEmail: 'urban@civicpulse.gov', slaHours: 168, contactPhone: '+91-9876543216' },
];
const locations = [
    { address: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101, ward: 'Ward 10', city: 'Chennai' },
    { address: 'T Nagar, Chennai', lat: 13.0418, lng: 80.2341, ward: 'Ward 15', city: 'Chennai' },
    { address: 'Adyar, Chennai', lat: 13.0067, lng: 80.2206, ward: 'Ward 20', city: 'Chennai' },
    { address: 'Velachery, Chennai', lat: 12.9815, lng: 80.2180, ward: 'Ward 25', city: 'Chennai' },
    { address: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000, ward: 'Ward 30', city: 'Chennai' },
    { address: 'Porur, Chennai', lat: 13.0324, lng: 80.1565, ward: 'Ward 35', city: 'Chennai' },
    { address: 'Sholinganallur, Chennai', lat: 12.9010, lng: 80.2279, ward: 'Ward 40', city: 'Chennai' },
    { address: 'Mylapore, Chennai', lat: 13.0368, lng: 80.2676, ward: 'Ward 45', city: 'Chennai' },
    { address: 'Guindy, Chennai', lat: 13.0067, lng: 80.2206, ward: 'Ward 50', city: 'Chennai' },
    { address: 'Chromepet, Chennai', lat: 12.9516, lng: 80.1462, ward: 'Ward 55', city: 'Chennai' },
];
const issueTemplates = [
    { title: 'Large pothole on main road causing accidents', category: 'Pothole', severity: 'critical', description: 'There is a dangerous pothole near the school zone that has caused multiple accidents. Immediate attention required.', priorityScore: 92 },
    { title: 'Overflowing garbage bins near market area', category: 'Garbage', severity: 'high', description: 'Garbage bins near the local market have been overflowing for 3 days creating health hazards.', priorityScore: 78 },
    { title: 'Blocked drainage causing waterlogging', category: 'Drainage', severity: 'high', description: 'The main drainage channel is blocked causing severe waterlogging during rains, flooding residential areas.', priorityScore: 85 },
    { title: 'Broken streetlight on residential road', category: 'Streetlight', severity: 'medium', description: 'Streetlight has been non-functional for 2 weeks making the road unsafe at night.', priorityScore: 55 },
    { title: 'Water pipe burst flooding the street', category: 'Water Leakage', severity: 'critical', description: 'A major water pipe has burst flooding the street and causing water shortage in the area. Emergency repair needed.', priorityScore: 95 },
    { title: 'Severe road damage after heavy rain', category: 'Road Damage', severity: 'high', description: 'Heavy rainfall has caused significant damage to the road surface making it dangerous for vehicles.', priorityScore: 80 },
    { title: 'Large tree fallen blocking road', category: 'Fallen Tree', severity: 'critical', description: 'A large tree fell during last night\'s storm completely blocking the main road. Emergency clearing required.', priorityScore: 98 },
    { title: 'Broken footpath tiles causing injury risk', category: 'Broken Footpath', severity: 'medium', description: 'Multiple footpath tiles are broken and uplifted posing risk of injury to pedestrians, especially elderly.', priorityScore: 62 },
    { title: 'Traffic signal malfunctioning at junction', category: 'Traffic Signal', severity: 'high', description: 'Traffic signal at the major junction has been showing red constantly causing massive traffic jams.', priorityScore: 88 },
    { title: 'Illegal construction encroaching footpath', category: 'Encroachment', severity: 'medium', description: 'Construction materials have been placed on the public footpath blocking pedestrian movement for over a week.', priorityScore: 58 },
    { title: 'Deep pothole causing tyre damage', category: 'Pothole', severity: 'high', description: 'Deep pothole on the main arterial road is damaging vehicles. Multiple complaints received.', priorityScore: 75 },
    { title: 'Garbage pile near school premises', category: 'Garbage', severity: 'high', description: 'Large garbage pile near school is creating unhygienic conditions affecting children\'s health.', priorityScore: 82 },
    { title: 'Sewage overflow on residential street', category: 'Drainage', severity: 'critical', description: 'Sewage is overflowing onto the street creating severe health hazards. Requires immediate action.', priorityScore: 94 },
    { title: 'Multiple streetlights down in colony', category: 'Streetlight', severity: 'high', description: 'Entire stretch of 500m road is dark due to multiple streetlight failures. Night safety compromised.', priorityScore: 72 },
    { title: 'Water supply contamination reported', category: 'Water Leakage', severity: 'critical', description: 'Residents are reporting discolored water supply indicating pipeline contamination. Health risk.', priorityScore: 96 },
];
async function seed() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await Promise.all([
        User_1.default.deleteMany({}),
        Department_1.default.deleteMany({}),
        Issue_1.default.deleteMany({}),
        Notification_1.default.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');
    const createdDepts = await Department_1.default.insertMany(departments);
    console.log(`✅ Created ${createdDepts.length} departments`);
    const deptMap = {};
    createdDepts.forEach(d => { deptMap[d.code] = String(d._id); });
    const users = [
        { name: 'Admin User', email: 'admin@civicpulse.gov', password: 'Admin@123', role: 'admin', isVerified: true, trustScore: 100, phone: '+91-9876540001' },
        { name: 'Ravi Kumar', email: 'officer.roads@civicpulse.gov', password: 'Officer@123', role: 'officer', isVerified: true, department: deptMap['ROADS'], trustScore: 90, phone: '+91-9876540002' },
        { name: 'Priya Sharma', email: 'officer.sanit@civicpulse.gov', password: 'Officer@123', role: 'officer', isVerified: true, department: deptMap['SANIT'], trustScore: 88, phone: '+91-9876540003' },
        { name: 'Karthik Raj', email: 'officer.water@civicpulse.gov', password: 'Officer@123', role: 'officer', isVerified: true, department: deptMap['WATER'], trustScore: 92, phone: '+91-9876540004' },
        { name: 'Meena Devi', email: 'citizen1@gmail.com', password: 'Citizen@123', role: 'citizen', trustScore: 75, phone: '+91-9876540005', address: 'Anna Nagar, Chennai', ward: 'Ward 10' },
        { name: 'Suresh Babu', email: 'citizen2@gmail.com', password: 'Citizen@123', role: 'citizen', trustScore: 68, phone: '+91-9876540006', address: 'T Nagar, Chennai', ward: 'Ward 15' },
        { name: 'Lakshmi Priya', email: 'citizen3@gmail.com', password: 'Citizen@123', role: 'citizen', trustScore: 82, phone: '+91-9876540007', address: 'Adyar, Chennai', ward: 'Ward 20' },
        { name: 'Anand Krishnan', email: 'citizen4@gmail.com', password: 'Citizen@123', role: 'citizen', trustScore: 71, phone: '+91-9876540008', address: 'Velachery, Chennai', ward: 'Ward 25' },
        { name: 'Vijaya Kumari', email: 'citizen5@gmail.com', password: 'Citizen@123', role: 'citizen', trustScore: 79, phone: '+91-9876540009', address: 'Tambaram, Chennai', ward: 'Ward 30' },
        { name: 'Rajesh Pandian', email: 'citizen6@gmail.com', password: 'Citizen@123', role: 'citizen', trustScore: 65, phone: '+91-9876540010', address: 'Porur, Chennai', ward: 'Ward 35' },
    ];
    const hashedUsers = await Promise.all(users.map(async (u) => ({
        ...u,
        password: await bcryptjs_1.default.hash(u.password, 12)
    })));
    const createdUsers = await User_1.default.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);
    const citizens = createdUsers.filter(u => u.role === 'citizen');
    const officer = createdUsers.find(u => u.role === 'officer' && u.email === 'officer.roads@civicpulse.gov');
    const statuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
    const issuesData = issueTemplates.map((tmpl, i) => {
        const loc = locations[i % locations.length];
        const citizen = citizens[i % citizens.length];
        const statusIdx = i % statuses.length;
        const status = statuses[statusIdx];
        const dept = createdDepts.find(d => d.categories.includes(tmpl.category)) || createdDepts[0];
        const createdDate = new Date(Date.now() - (i * 2 + 1) * 24 * 3600 * 1000);
        const timeline = [
            { status: 'pending', message: 'Issue reported by citizen', updatedBy: citizen._id, timestamp: createdDate },
        ];
        const officerId = officer._id;
        if (statusIdx >= 1)
            timeline.push({ status: 'assigned', message: 'Issue assigned to department officer', updatedBy: officerId, timestamp: new Date(createdDate.getTime() + 3600 * 1000) });
        if (statusIdx >= 2)
            timeline.push({ status: 'in_progress', message: 'Team dispatched to location', updatedBy: officerId, timestamp: new Date(createdDate.getTime() + 7200 * 1000) });
        if (statusIdx >= 3)
            timeline.push({ status: 'resolved', message: 'Issue has been resolved', updatedBy: officerId, timestamp: new Date(createdDate.getTime() + 86400 * 1000) });
        if (statusIdx >= 4)
            timeline.push({ status: 'closed', message: 'Issue verified and closed', updatedBy: officerId, timestamp: new Date(createdDate.getTime() + 100000 * 1000) });
        return {
            ...tmpl,
            location: loc,
            reportedBy: citizen._id,
            assignedTo: statusIdx >= 1 ? officer?._id : undefined,
            department: dept._id,
            status,
            timeline,
            images: [],
            upvotes: citizens.slice(0, i % 5).map(c => c._id),
            aiAnalysis: { confidence: 0.85 + (i % 10) / 100, detectedCategory: tmpl.category, spamProbability: 0.02, duplicateProbability: 0.05, suggestedDepartment: dept.name },
            verification: statusIdx >= 4 ? { isVerified: true, verifiedBy: officer?._id, verifiedAt: new Date(), resolutionQuality: 'good', notes: 'AI verified resolution confirmed.' } : undefined,
            resolvedAt: statusIdx >= 3 ? new Date(createdDate.getTime() + 86400 * 1000) : undefined,
            slaDue: new Date(createdDate.getTime() + dept.slaHours * 3600 * 1000),
            createdAt: createdDate,
        };
    });
    const createdIssues = await Issue_1.default.insertMany(issuesData);
    console.log(`✅ Created ${createdIssues.length} issues`);
    const notifications = createdIssues.slice(0, 8).map((issue, i) => ({
        user: citizens[i % citizens.length]._id,
        title: ['Issue Submitted', 'Status Updated', 'Issue Resolved', 'Issue Assigned'][i % 4],
        message: `Your issue "${issue.title}" has been ${['submitted', 'updated', 'resolved', 'assigned to department'][i % 4]}.`,
        type: ['success', 'update', 'success', 'info'][i % 4],
        issue: issue._id,
        isRead: i % 3 === 0,
    }));
    await Notification_1.default.insertMany(notifications);
    console.log(`✅ Created ${notifications.length} notifications`);
    console.log('\n🎉 Seed completed successfully!\n');
    console.log('Demo Accounts:');
    console.log('  Admin:   admin@civicpulse.gov / Admin@123');
    console.log('  Officer: officer.roads@civicpulse.gov / Officer@123');
    console.log('  Citizen: citizen1@gmail.com / Citizen@123');
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=seed.js.map