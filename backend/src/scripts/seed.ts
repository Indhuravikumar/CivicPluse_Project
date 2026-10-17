import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User';
import Department from '../models/Department';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicpulse';

const departments = [
  { name: 'Roads & Infrastructure', code: 'ROADS', description: 'Manages road maintenance, potholes, and infrastructure', categories: ['Pothole', 'Road Damage', 'Broken Footpath'], contactEmail: 'roads@civicpulse.gov', slaHours: 48, contactPhone: '+91-9876543210' },
  { name: 'Sanitation Department', code: 'SANIT', description: 'Handles garbage collection and cleanliness', categories: ['Garbage', 'Encroachment'], contactEmail: 'sanitation@civicpulse.gov', slaHours: 24, contactPhone: '+91-9876543211' },
  { name: 'Water & Sewage Board', code: 'WATER', description: 'Water supply and sewage management', categories: ['Water Leakage'], contactEmail: 'water@civicpulse.gov', slaHours: 12, contactPhone: '+91-9876543212' },
  { name: 'Electricity Department', code: 'ELECT', description: 'Streetlights and electrical infrastructure', categories: ['Streetlight'], contactEmail: 'electricity@civicpulse.gov', slaHours: 24, contactPhone: '+91-9876543213' },
  { name: 'Drainage Department', code: 'DRAIN', description: 'Drainage management', categories: ['Drainage'], contactEmail: 'drainage@civicpulse.gov', slaHours: 24, contactPhone: '+91-9876543217' },
  { name: 'Parks & Environment', code: 'PARKS', description: 'Green spaces and environmental management', categories: ['Fallen Tree'], contactEmail: 'parks@civicpulse.gov', slaHours: 72, contactPhone: '+91-9876543214' },
  { name: 'Traffic Management Cell', code: 'TRAFF', description: 'Traffic signals and road safety', categories: ['Traffic Signal'], contactEmail: 'traffic@civicpulse.gov', slaHours: 6, contactPhone: '+91-9876543215' },
  { name: 'Urban Planning Department', code: 'URBAN', description: 'Urban development and encroachment removal', categories: ['Other'], contactEmail: 'urban@civicpulse.gov', slaHours: 168, contactPhone: '+91-9876543216' },
];

const mockAdmin = { name: 'Admin User', email: 'admin@civicpulse.test', password: 'Admin@123', role: 'admin', isVerified: true, isActive: true, trustScore: 100, phone: '+91-9876540001' };

const mockCitizens = [
  { name: 'Arun Citizen', email: 'arun.citizen@civicpulse.test', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, trustScore: 80 },
  { name: 'Meena Citizen', email: 'meena.citizen@civicpulse.test', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, trustScore: 80 },
  { name: 'Kiran Citizen', email: 'kiran.citizen@civicpulse.test', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, trustScore: 80 },
  { name: 'Priya Citizen', email: 'priya.citizen@civicpulse.test', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, trustScore: 80 },
  { name: 'Rahul Citizen', email: 'rahul.citizen@civicpulse.test', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, trustScore: 80 },
];

const mockOfficers = [
  { name: 'Ravi Kumar', email: 'ravi.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'ROADS', isVerified: true, isActive: true, trustScore: 90 },
  { name: 'Arjun Raj', email: 'arjun.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'ROADS', isVerified: true, isActive: true, trustScore: 90 },
  
  { name: 'Suresh Kumar', email: 'suresh.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'SANIT', isVerified: true, isActive: true, trustScore: 90 },
  { name: 'Manoj Kumar', email: 'manoj.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'SANIT', isVerified: true, isActive: true, trustScore: 90 },
  
  { name: 'Karthik R', email: 'karthik.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'ELECT', isVerified: true, isActive: true, trustScore: 90 },
  { name: 'Vignesh P', email: 'vignesh.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'ELECT', isVerified: true, isActive: true, trustScore: 90 },
  
  { name: 'Pradeep M', email: 'pradeep.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'WATER', isVerified: true, isActive: true, trustScore: 90 },
  { name: 'Naveen K', email: 'naveen.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'WATER', isVerified: true, isActive: true, trustScore: 90 },
  
  { name: 'Dinesh S', email: 'dinesh.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'DRAIN', isVerified: true, isActive: true, trustScore: 90 },
  { name: 'Rahul V', email: 'rahul.officer@civicpulse.test', password: 'Officer@123', role: 'officer', deptCode: 'DRAIN', isVerified: true, isActive: true, trustScore: 90 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // 1. Seed Departments (Idempotent)
  let deptsCreated = 0;
  let deptsUpdated = 0;
  const deptMap: Record<string, string> = {};

  for (const deptData of departments) {
    let dept = await Department.findOne({ code: deptData.code });
    if (dept) {
      // Update existing
      dept.name = deptData.name;
      dept.categories = deptData.categories;
      dept.description = deptData.description;
      await dept.save();
      deptsUpdated++;
    } else {
      dept = await Department.create(deptData);
      deptsCreated++;
    }
    deptMap[deptData.code] = String(dept._id);
  }
  console.log(`✅ Departments -> Created: ${deptsCreated}, Updated/Reused: ${deptsUpdated}`);

  let usersCreated = 0;
  let usersUpdated = 0;

  // Function to seed a user idempotently
  const seedUser = async (userData: any, deptCode?: string) => {
    let user = await User.findOne({ email: userData.email });
    if (user) {
      user.name = userData.name;
      user.role = userData.role;
      user.isActive = userData.isActive;
      user.isVerified = userData.isVerified;
      if (deptCode && deptMap[deptCode]) {
        user.department = deptMap[deptCode] as any;
      }
      // Note: we purposely avoid setting password here to prevent rehashing or changing existing user password
      await user.save(); // pre-save hashes password only if modified
      usersUpdated++;
    } else {
      const createData = { ...userData };
      if (deptCode && deptMap[deptCode]) {
        createData.department = deptMap[deptCode];
      }
      await User.create(createData);
      usersCreated++;
    }
  };

  // 2. Seed Admin
  await seedUser(mockAdmin);

  // 3. Seed Citizens
  for (const citizen of mockCitizens) {
    await seedUser(citizen);
  }

  // 4. Seed Officers
  for (const officer of mockOfficers) {
    const { deptCode, ...officerData } = officer;
    await seedUser(officerData, deptCode);
  }

  console.log(`✅ Users -> Created: ${usersCreated}, Updated/Reused: ${usersUpdated}`);

  console.log('\n========================================');
  console.log('CIVICPULSE DEVELOPMENT SEED COMPLETE');
  console.log('========================================');
  
  console.log('\nOFFICERS');
  console.log('----------------------------------------');
  for (const officer of mockOfficers) {
    console.log(`${officer.email}`);
    console.log(`Password: ${officer.password}\n`);
  }

  console.log('CITIZENS');
  console.log('----------------------------------------');
  for (const citizen of mockCitizens) {
    console.log(`${citizen.email}`);
    console.log(`Password: ${citizen.password}\n`);
  }

  console.log('ADMIN');
  console.log('----------------------------------------');
  console.log(`${mockAdmin.email}`);
  console.log(`Password: ${mockAdmin.password}`);
  console.log('\n========================================');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
