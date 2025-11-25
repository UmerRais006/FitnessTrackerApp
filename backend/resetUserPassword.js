require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function resetUserPassword() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            console.error('MONGODB_URI not found in .env file');
            process.exit(1);
        }

        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB\n');

        // User to reset
        const userEmail = 'umerrais006@gmail.com';
        const newPassword = 'Umer123456';

        console.log(`Resetting password for: ${userEmail}`);

        // Find user
        const user = await User.findOne({ email: userEmail.toLowerCase() });
        
        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        // Update password (will be hashed automatically by pre-save hook)
        user.password = newPassword;
        await user.save();

        console.log('✅ Password reset successfully!\n');
        console.log('New Login Credentials:');
        console.log('======================');
        console.log(`Email: ${userEmail}`);
        console.log(`Password: ${newPassword}`);
        console.log('======================\n');

        // Test login
        console.log('Testing login with new password...');
        try {
            const loginUser = await User.findByCredentials(userEmail, newPassword);
            console.log('✅ Login test successful!');
            console.log(`Logged in as: ${loginUser.fullName}\n`);
        } catch (error) {
            console.log('❌ Login test failed!');
            console.log('Error:', error.message);
        }

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetUserPassword();
