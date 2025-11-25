require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('+password');
        console.log(`\nFound ${users.length} users in database:\n`);
        
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Full Name: ${user.fullName}`);
            console.log(`  Password Hash: ${user.password.substring(0, 20)}...`);
            console.log(`  Created: ${user.createdAt}`);
            console.log('');
        });

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
