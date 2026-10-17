import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User';
import Department from '../models/Department';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicpulse';

const demoOfficers = [
  { name: 'Arjun Kumar', email: 'officer.electricity@civicpulse.local', deptName: 'Electricity Department' },
  { name: 'Priya Nair', email: 'officer.electricity2@civicpulse.local', deptName: 'Electricity Department' },
  { name: 'Rahul Sharma', email: 'officer.roads@civicpulse.local', deptName: 'Roads & Infrastructure' },
  { name: 'Meena Krishnan', email: 'officer.water@civicpulse.local', deptName: 'Water & Sewage Board' },
  { name: 'Karthik Raj', email: 'officer.waste@civicpulse.local', deptName: 'Sanitation Department' },
  { name: 'Naveen Kumar', email: 'officer.drainage@civicpulse.local', deptName: 'Water & Sewage Board' }, 
];

const DEMO_PASSWORD = 'CivicPulse@123';

async function seedOfficers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const departments = await Department.find({});
    if (departments.length === 0) {
      console.error('❌ No departments found. Please run the main seed script first.');
      process.exit(1);
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const officer of demoOfficers) {
      const dept = departments.find(d => d.name === officer.deptName || d.name.includes(officer.deptName.split(' ')[0]));
      
      if (!dept) {
        console.warn(`⚠️  Department "${officer.deptName}" not found. Skipping ${officer.name}.`);
        continue;
      }

      const existingUser = await User.findOne({ email: officer.email });

      if (existingUser) {
        existingUser.role = 'officer';
        existingUser.department = dept._id as unknown as mongoose.Types.ObjectId;
        existingUser.isActive = true;
        existingUser.name = officer.name;
        // The password hash is already handled on creation, we don't reset it here to avoid overwriting testing changes.
        await existingUser.save();
        updatedCount++;
      } else {
        await User.create({
          name: officer.name,
          email: officer.email,
          password: DEMO_PASSWORD, // Pre-save hook hashes this
          role: 'officer',
          department: dept._id,
          isActive: true,
          isVerified: true,
        });
        createdCount++;
      }
    }

    console.log(`\n🎉 Seed completed!`);
    console.log(`✅ Created: ${createdCount} officers`);
    console.log(`✅ Updated: ${updatedCount} officers\n`);
    
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Ensure this doesn't run automatically in production unless explicitly executed
if (process.env.NODE_ENV !== 'production') {
  seedOfficers();
} else {
  console.error('❌ Cannot run dev seed in production environment.');
  process.exit(1);
}
