const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check all users in database
        const users = await User.find({});
        console.log('\n📋 All users in database:');
        users.forEach(user => {
            console.log(`  - Email: ${user.email}`);
            console.log(`    Name: ${user.fullName}`);
            console.log(`    ID: ${user._id}`);
            console.log('');
        });

        // Try to find with lowercase
        const userLower = await User.findOne({ email: 'umerrais006@gmail.com' });
        console.log('🔍 Search for "umerrais006@gmail.com":', userLower ? 'FOUND ✅' : 'NOT FOUND ❌');

        // Try to find with capital U
        const userCap = await User.findOne({ email: 'Umerrais006@gmail.com' });
        console.log('🔍 Search for "Umerrais006@gmail.com":', userCap ? 'FOUND ✅' : 'NOT FOUND ❌');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkUser();
