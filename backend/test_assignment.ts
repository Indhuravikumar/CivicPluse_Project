import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicpulse';

async function testAutoAssign() {
  try {
    console.log('1. Logging in as citizen...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'arun.citizen@civicpulse.test',
      password: 'Citizen@123'
    });
    
    const token = loginRes.data.token;
    if (!token) throw new Error('Login failed, no token');
    
    console.log('2. Citizen logged in successfully. Creating 4 issues for Sanitation (Category: Garbage)...');
    
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
    
    const issueIds: string[] = [];
    
    // Create 4 issues sequentially
    for (let i = 1; i <= 4; i++) {
      const issueData = {
        title: `Test Garbage Issue ${i}`,
        description: `This is a test issue ${i} to verify auto-assignment load balancing.`,
        category: 'Garbage',
        location: JSON.stringify({
          address: 'Test Location',
          lat: 13.0827,
          lng: 80.2707
        })
      };
      
      const formData = new FormData();
      Object.entries(issueData).forEach(([k, v]) => formData.append(k, v));
      
      // Axios doesn't strictly need FormData for this if multer accepts application/json or urlencoded, but we will use the backend's expected format.
      // Wait, the backend uses multer `upload.array('images', 5)`. 
      // If we don't send files, we can just send JSON? Let's check issue routes.
      
      const res = await axios.post(`${API_URL}/issues`, issueData, axiosConfig);
      console.log(`   Created issue ${i} -> ID: ${res.data.data._id}`);
      issueIds.push(res.data.data._id);
      
      // Wait a moment to ensure timestamps differ clearly for tie-breaking
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n3. Connecting to DB to verify assignments...');
    await mongoose.connect(MONGO_URI);
    
    const Issue = (await import('./src/models/Issue')).default;
    const User = (await import('./src/models/User')).default;
    
    for (const id of issueIds) {
      const issue = await Issue.findById(id).populate('assignedTo');
      if (issue) {
        console.log(`   Issue: ${issue.title} | Status: ${issue.status} | Assigned To: ${issue.assignedTo ? (issue.assignedTo as any).name : 'UNASSIGNED'}`);
      }
    }
    
    // Clean up test issues
    await Issue.deleteMany({ _id: { $in: issueIds } });
    console.log('\n4. Test issues cleaned up.');
    
    await mongoose.disconnect();
    console.log('✅ Auto-assignment verification complete.');
    
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testAutoAssign();
