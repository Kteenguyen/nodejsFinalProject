// backend/fixAdmin.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/userModel');

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check current admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    console.log('Current admin user:');
    console.log('   role:', admin?.role);
    
    // Update admin user with role only (no isAdmin since it's not in schema)
    const updated = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      { $set: { role: 'admin' } },
      { new: true }
    );
    
    if (updated) {
      console.log('✅ Updated admin:', updated.email);
      console.log('   role:', updated.role);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

fixAdmin();
