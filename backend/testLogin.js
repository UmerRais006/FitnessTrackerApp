// Test script to check if user exists and reset password if needed
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'umerrais006@gmail.com';
        
        // Check if user exists
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ User not found. Creating new user...');
            
            // Create new user with password: password123
            const newUser = await User.create({
                fullName: 'Umer',
                email: email,
                password: 'password123' // Must be at least 8 characters
            });
            
            console.log('✅ New user created successfully!');
            console.log('📧 Email:', email);
            console.log('🔑 Password: password123');
        } else {
            console.log('✅ User found!');
            console.log('User details:', {
                fullName: user.fullName,
                email: user.email,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            });
            
            // Reset password to: password123
            user.password = 'password123';
            await user.save();
            console.log('✅ Password reset to: password123');
        }
        
        // Test login
        console.log('\n🔐 Testing login...');
        const testUser = await User.findByCredentials(email, 'password123');
        console.log('✅ Login test successful!');
        
        await mongoose.connection.close();
        console.log('\n✅ All done! You can now login with:');
        console.log('📧 Email: umerrais006@gmail.com');
        console.log('🔑 Password: password123');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
    }
}

testLogin();
